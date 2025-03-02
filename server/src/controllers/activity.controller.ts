// server/src/controllers/activity.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Activity } from '../entities/Activity';
import { Service } from '../entities/Service';
import { Journey } from '../entities/Journey';
import { MeasurementEvaluation } from '../entities/MeasurementEvaluation';
import { In } from 'typeorm';

// Get all activities
export const getAllActivities = async (req: Request, res: Response) => {
  try {
    const activityRepository = AppDataSource.getRepository(Activity);
    const activities = await activityRepository.find({
      relations: ['journey']
    });
    
    return res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({ message: 'Error fetching activities' });
  }
};

// Get activity by ID
export const getActivityById = async (req: Request, res: Response) => {
  try {
    const activityRepository = AppDataSource.getRepository(Activity);
    const activity = await activityRepository.findOne({
      where: { id: req.params.id },
      relations: ['journey']
    });
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    return res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return res.status(500).json({ message: 'Error fetching activity' });
  }
};

// Get activity services
export const getActivityServices = async (req: Request, res: Response) => {
  try {
    const serviceRepository = AppDataSource.getRepository(Service);
    const services = await serviceRepository.find({
      where: { activity: { id: req.params.id } }
    });
    
    return res.json(services);
  } catch (error) {
    console.error('Error fetching activity services:', error);
    return res.status(500).json({ message: 'Error fetching activity services' });
  }
};

// Get activity journey
export const getActivityJourney = async (req: Request, res: Response) => {
  try {
    const activityRepository = AppDataSource.getRepository(Activity);
    const activity = await activityRepository.findOne({
      where: { id: req.params.id },
      relations: ['journey']
    });
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    if (!activity.journey) {
      return res.status(404).json({ message: 'Activity is not assigned to any journey' });
    }
    
    return res.json(activity.journey);
  } catch (error) {
    console.error('Error fetching activity journey:', error);
    return res.status(500).json({ message: 'Error fetching activity journey' });
  }
};

// Get activity maturity summaries
export const getActivityMaturitySummaries = async (req: Request, res: Response) => {
  try {
    const activityRepository = AppDataSource.getRepository(Activity);
    const serviceRepository = AppDataSource.getRepository(Service);
    const evaluationRepository = AppDataSource.getRepository(MeasurementEvaluation);
    
    const activity = await activityRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    // Get services for this activity
    const services = await serviceRepository.find({
      where: { activity: { id: activity.id } }
    });
    
    if (services.length === 0) {
      return res.json([]);
    }
    
    const serviceIds = services.map(s => s.id);
    
    // Get evaluations for all services in this activity
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
    console.error('Error fetching activity maturity summaries:', error);
    return res.status(500).json({ message: 'Error fetching activity maturity summaries' });
  }
};

// Create activity (admin/editor)
export const createActivity = async (req: Request, res: Response) => {
  try {
    const { name, owner, description, dependencyGraph, journeyId } = req.body;
    
    if (!name || !owner || !description) {
      return res.status(400).json({ message: 'Name, owner, and description are required' });
    }
    
    const activityRepository = AppDataSource.getRepository(Activity);
    const journeyRepository = AppDataSource.getRepository(Journey);
    
    // Check if journey exists if journeyId is provided
    let journey: Journey | null = null;
    if (journeyId) {
      journey = await journeyRepository.findOne({ where: { id: journeyId } });
      
      if (!journey) {
        return res.status(404).json({ message: 'Journey not found' });
      }
    }
    
    // Create new activity using constructor approach
    const newActivity = new Activity();
    newActivity.name = name;
    newActivity.owner = owner;
    newActivity.description = description;
    newActivity.dependencyGraph = dependencyGraph ? JSON.stringify(dependencyGraph) : null;
    newActivity.journey = journey;
    
    const savedActivity = await activityRepository.save(newActivity);
    
    return res.status(201).json(savedActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    return res.status(500).json({ message: 'Error creating activity' });
  }
};

// Update activity (admin/editor)
export const updateActivity = async (req: Request, res: Response) => {
  try {
    const { name, owner, description, dependencyGraph, journeyId } = req.body;
    
    const activityRepository = AppDataSource.getRepository(Activity);
    const journeyRepository = AppDataSource.getRepository(Journey);
    
    const activity = await activityRepository.findOne({
      where: { id: req.params.id },
      relations: ['journey']
    });
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    // Update journey if journeyId is provided
    if (journeyId !== undefined) {
      if (journeyId) {
        const journey = await journeyRepository.findOne({ where: { id: journeyId } });
        
        if (!journey) {
          return res.status(404).json({ message: 'Journey not found' });
        }
        
        activity.journey = journey;
      } else {
        activity.journey = null;
      }
    }
    
    if (name) activity.name = name;
    if (owner) activity.owner = owner;
    if (description) activity.description = description;
    if (dependencyGraph !== undefined) {
      activity.dependencyGraph = dependencyGraph ? JSON.stringify(dependencyGraph) : null;
    }
    
    await activityRepository.save(activity);
    
    return res.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    return res.status(500).json({ message: 'Error updating activity' });
  }
};

// Delete activity (admin only)
export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const activityRepository = AppDataSource.getRepository(Activity);
    const activity = await activityRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    await activityRepository.remove(activity);
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting activity:', error);
    return res.status(500).json({ message: 'Error deleting activity' });
  }
};