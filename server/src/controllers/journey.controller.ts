// server/src/controllers/journey.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Journey } from '../entities/Journey';
import { Activity } from '../entities/Activity';
import { Service } from '../entities/Service';
import { MeasurementEvaluation } from '../entities/MeasurementEvaluation';
import { In } from 'typeorm';

// Get all journeys
export const getAllJourneys = async (req: Request, res: Response) => {
  try {
    const journeyRepository = AppDataSource.getRepository(Journey);
    const journeys = await journeyRepository.find();
    
    return res.json(journeys);
  } catch (error) {
    console.error('Error fetching journeys:', error);
    return res.status(500).json({ message: 'Error fetching journeys' });
  }
};

// Get journey by ID
export const getJourneyById = async (req: Request, res: Response) => {
  try {
    const journeyRepository = AppDataSource.getRepository(Journey);
    const journey = await journeyRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!journey) {
      return res.status(404).json({ message: 'Journey not found' });
    }
    
    return res.json(journey);
  } catch (error) {
    console.error('Error fetching journey:', error);
    return res.status(500).json({ message: 'Error fetching journey' });
  }
};

// Get journey activities with services
export const getJourneyActivities = async (req: Request, res: Response) => {
  try {
    const activityRepository = AppDataSource.getRepository(Activity);
    const serviceRepository = AppDataSource.getRepository(Service);
    
    const activities = await activityRepository.find({
      where: { journey: { id: req.params.id } }
    });
    
    const activitiesWithServices = [];
    
    for (const activity of activities) {
      const services = await serviceRepository.find({
        where: { activity: { id: activity.id } }
      });
      
      activitiesWithServices.push({
        ...activity,
        services
      });
    }
    
    return res.json(activitiesWithServices);
  } catch (error) {
    console.error('Error fetching journey activities:', error);
    return res.status(500).json({ message: 'Error fetching journey activities' });
  }
};

// Get journey maturity summaries
export const getJourneyMaturitySummaries = async (req: Request, res: Response) => {
  try {
    const journeyRepository = AppDataSource.getRepository(Journey);
    const activityRepository = AppDataSource.getRepository(Activity);
    const serviceRepository = AppDataSource.getRepository(Service);
    const evaluationRepository = AppDataSource.getRepository(MeasurementEvaluation);
    
    const journey = await journeyRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!journey) {
      return res.status(404).json({ message: 'Journey not found' });
    }
    
    // Get activities for this journey
    const activities = await activityRepository.find({
      where: { journey: { id: journey.id } }
    });
    
    if (activities.length === 0) {
      return res.json([]);
    }
    
    const activityIds = activities.map(a => a.id);
    
    // Get services for all activities in this journey
    const services = await serviceRepository.find({
      where: { activity: { id: In(activityIds) } }
    });
    
    if (services.length === 0) {
      return res.json([]);
    }
    
    const serviceIds = services.map(s => s.id);
    
    // Get evaluations for all services in this journey
    const evaluations = await evaluationRepository.find({
      where: { service: { id: In(serviceIds) } },
      relations: ['campaign', 'campaign.maturityModel']
    });
    
    // Group evaluations by maturity model
    const modelMap = new Map();
    
    for (const evaluation of evaluations) {
      const modelId = evaluation.campaign.maturityModel.id;
      const modelName = evaluation.campaign.maturityModel.name;
      
      if (!modelMap.has(modelId)) {
        modelMap.set(modelId, {
          maturityModelId: modelId,
          maturityModelName: modelName,
          implementedCount: 0,
          totalCount: 0
        });
      }
      
      modelMap.get(modelId).totalCount++;
      
      if (evaluation.status === 'implemented') {
        modelMap.get(modelId).implementedCount++;
      }
    }
    
    // Calculate maturity level for each model
    const result = [];
    
    for (const [_, data] of modelMap) {
      const percentage = data.totalCount > 0 ? (data.implementedCount / data.totalCount) * 100 : 0;
      
      // Determine maturity level based on percentage
      let maturityLevel = 0;
      if (percentage >= 100) maturityLevel = 4;
      else if (percentage >= 75) maturityLevel = 3;
      else if (percentage >= 50) maturityLevel = 2;
      else if (percentage >= 25) maturityLevel = 1;
      
      result.push({
        maturityModelId: data.maturityModelId,
        maturityModelName: data.maturityModelName,
        maturityLevel,
        percentage
      });
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching journey maturity summaries:', error);
    return res.status(500).json({ message: 'Error fetching journey maturity summaries' });
  }
};

// Create journey (admin/editor)
export const createJourney = async (req: Request, res: Response) => {
  try {
    const { name, owner, description, dependencyGraph } = req.body;
    
    if (!name || !owner || !description) {
      return res.status(400).json({ message: 'Name, owner, and description are required' });
    }
    
    const journeyRepository = AppDataSource.getRepository(Journey);
    
    // Create new journey using constructor approach
    const newJourney = new Journey();
    newJourney.name = name;
    newJourney.owner = owner;
    newJourney.description = description;
    newJourney.dependencyGraph = dependencyGraph ? JSON.stringify(dependencyGraph) : null;
    
    const savedJourney = await journeyRepository.save(newJourney);
    
    return res.status(201).json(savedJourney);
  } catch (error) {
    console.error('Error creating journey:', error);
    return res.status(500).json({ message: 'Error creating journey' });
  }
};

// Update journey (admin/editor)
export const updateJourney = async (req: Request, res: Response) => {
  try {
    const { name, owner, description, dependencyGraph } = req.body;
    
    const journeyRepository = AppDataSource.getRepository(Journey);
    
    const journey = await journeyRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!journey) {
      return res.status(404).json({ message: 'Journey not found' });
    }
    
    if (name) journey.name = name;
    if (owner) journey.owner = owner;
    if (description) journey.description = description;
    if (dependencyGraph !== undefined) {
      journey.dependencyGraph = dependencyGraph ? JSON.stringify(dependencyGraph) : null;
    }
    
    await journeyRepository.save(journey);
    
    return res.json(journey);
  } catch (error) {
    console.error('Error updating journey:', error);
    return res.status(500).json({ message: 'Error updating journey' });
  }
};

// Delete journey (admin only)
export const deleteJourney = async (req: Request, res: Response) => {
  try {
    const journeyRepository = AppDataSource.getRepository(Journey);
    const journey = await journeyRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!journey) {
      return res.status(404).json({ message: 'Journey not found' });
    }
    
    await journeyRepository.remove(journey);
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting journey:', error);
    return res.status(500).json({ message: 'Error deleting journey' });
  }
};