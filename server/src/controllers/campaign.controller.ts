// server/src/controllers/campaign.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Campaign } from '../entities/Campaign';
import { MaturityModel } from '../entities/MaturityModel';
import { MeasurementEvaluation } from '../entities/MeasurementEvaluation';
import { Service } from '../entities/Service';
import { Activity } from '../entities/Activity';
import { Journey } from '../entities/Journey';
import { In } from 'typeorm';

// Get all campaigns
export const getAllCampaigns = async (req: Request, res: Response) => {
  try {
    const campaignRepository = AppDataSource.getRepository(Campaign);
    const campaigns = await campaignRepository.find({
      relations: ['maturityModel']
    });
    
    return res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return res.status(500).json({ message: 'Error fetching campaigns' });
  }
};

// Get campaign by ID
export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const campaignRepository = AppDataSource.getRepository(Campaign);
    const campaign = await campaignRepository.findOne({
      where: { id: req.params.id },
      relations: ['maturityModel', 'maturityModel.measurements']
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    return res.json({
      campaign,
      maturityModel: campaign.maturityModel
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return res.status(500).json({ message: 'Error fetching campaign' });
  }
};

// Get campaign results
export const getCampaignResults = async (req: Request, res: Response) => {
  try {
    const campaignRepository = AppDataSource.getRepository(Campaign);
    const serviceRepository = AppDataSource.getRepository(Service);
    const activityRepository = AppDataSource.getRepository(Activity);
    const journeyRepository = AppDataSource.getRepository(Journey);
    const evaluationRepository = AppDataSource.getRepository(MeasurementEvaluation);
    
    const campaign = await campaignRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get all evaluations for this campaign
    const evaluations = await evaluationRepository.find({
      where: { campaign: { id: campaign.id } },
      relations: ['service', 'measurement']
    });
    
    // Group evaluations by service
    const serviceMap = new Map();
    const serviceIds = new Set();
    
    for (const evaluation of evaluations) {
      const serviceId = evaluation.service.id;
      serviceIds.add(serviceId);
      
      if (!serviceMap.has(serviceId)) {
        serviceMap.set(serviceId, {
          serviceId,
          serviceName: evaluation.service.name,
          evaluations: [],
          implementedCount: 0,
          totalCount: 0
        });
      }
      
      serviceMap.get(serviceId).evaluations.push(evaluation);
      serviceMap.get(serviceId).totalCount++;
      
      if (evaluation.status === 'implemented') {
        serviceMap.get(serviceId).implementedCount++;
      }
    }
    
    // Calculate maturity level for each service
    const serviceResults = [];
    
    for (const [_, data] of serviceMap) {
      const percentage = data.totalCount > 0 ? (data.implementedCount / data.totalCount) * 100 : 0;
      
      // Determine maturity level based on percentage
      let maturityLevel = 0;
      if (percentage >= 100) maturityLevel = 4;
      else if (percentage >= 75) maturityLevel = 3;
      else if (percentage >= 50) maturityLevel = 2;
      else if (percentage >= 25) maturityLevel = 1;
      
      serviceResults.push({
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        maturityLevel,
        percentage
      });
    }
    
    // Get activities containing these services
    const services = await serviceRepository.find({
      where: { id: In([...serviceIds]) },
      relations: ['activity']
    });
    
    const activityMap = new Map();
    const activityIds = new Set();
    
    for (const service of services) {
      if (service.activity) {
        const activityId = service.activity.id;
        activityIds.add(activityId);
        
        if (!activityMap.has(activityId)) {
          activityMap.set(activityId, {
            activityId,
            activityName: service.activity.name,
            serviceResults: []
          });
        }
        
        const serviceResult = serviceResults.find(r => r.serviceId === service.id);
        if (serviceResult) {
          activityMap.get(activityId).serviceResults.push(serviceResult);
        }
      }
    }
    
    // Calculate maturity level for each activity
    const activityResults = [];
    
    for (const [_, data] of activityMap) {
      if (data.serviceResults.length > 0) {
        // Activity maturity is the minimum of its services
        const maturityLevel = Math.min(...data.serviceResults.map((r: { maturityLevel: number }) => r.maturityLevel));
        
        activityResults.push({
          activityId: data.activityId,
          activityName: data.activityName,
          maturityLevel,
          serviceResults: data.serviceResults
        });
      }
    }
    
    // Get journeys containing these activities
    const activities = await activityRepository.find({
      where: { id: In([...activityIds]) },
      relations: ['journey']
    });
    
    const journeyMap = new Map();
    
    for (const activity of activities) {
      if (activity.journey) {
        const journeyId = activity.journey.id;
        
        if (!journeyMap.has(journeyId)) {
          journeyMap.set(journeyId, {
            journeyId,
            journeyName: activity.journey.name,
            activityResults: []
          });
        }
        
        const activityResult = activityResults.find(r => r.activityId === activity.id);
        if (activityResult) {
          journeyMap.get(journeyId).activityResults.push(activityResult);
        }
      }
    }
    
    // Calculate maturity level for each journey
    const journeyResults = [];
    
    for (const [_, data] of journeyMap) {
      if (data.activityResults.length > 0) {
        // Journey maturity is the minimum of its activities
        const maturityLevel = Math.min(...data.activityResults.map((r: { maturityLevel: number; }) => r.maturityLevel));
        
        journeyResults.push({
          journeyId: data.journeyId,
          journeyName: data.journeyName,
          maturityLevel,
          activityResults: data.activityResults
        });
      }
    }
    
    // Calculate overall maturity level
    let overallLevel = 0;
    let totalImplemented = 0;
    let totalMeasurements = 0;
    
    for (const evaluation of evaluations) {
      totalMeasurements++;
      if (evaluation.status === 'implemented') {
        totalImplemented++;
      }
    }
    
    const overallPercentage = totalMeasurements > 0 ? (totalImplemented / totalMeasurements) * 100 : 0;
    
    if (overallPercentage >= 100) overallLevel = 4;
    else if (overallPercentage >= 75) overallLevel = 3;
    else if (overallPercentage >= 50) overallLevel = 2;
    else if (overallPercentage >= 25) overallLevel = 1;
    
    return res.json({
      journeyResults,
      activityResults,
      serviceResults,
      overallLevel,
      overallPercentage
    });
  } catch (error) {
    console.error('Error fetching campaign results:', error);
    return res.status(500).json({ message: 'Error fetching campaign results' });
  }
};

// Create campaign (admin/editor)
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const { name, description, startDate, endDate, maturityModelId } = req.body;
    
    if (!name || !description || !startDate || !maturityModelId) {
      return res.status(400).json({ message: 'Name, description, startDate, and maturityModelId are required' });
    }
    
    const campaignRepository = AppDataSource.getRepository(Campaign);
    const modelRepository = AppDataSource.getRepository(MaturityModel);
    
    // Check if maturity model exists
    const maturityModel = await modelRepository.findOne({
      where: { id: maturityModelId },
      relations: ['measurements']
    });
    
    if (!maturityModel) {
      return res.status(404).json({ message: 'Maturity model not found' });
    }
    
    // Create new campaign using constructor approach
    const newCampaign = new Campaign();
    newCampaign.name = name;
    newCampaign.description = description;
    newCampaign.startDate = new Date(startDate);
    newCampaign.endDate = endDate ? new Date(endDate) : null;
    newCampaign.maturityModel = maturityModel;
    
    const savedCampaign = await campaignRepository.save(newCampaign);
    
    return res.status(201).json(savedCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ message: 'Error creating campaign' });
  }
};

// Update campaign (admin/editor)
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const { name, description, startDate, endDate, maturityModelId } = req.body;
    
    const campaignRepository = AppDataSource.getRepository(Campaign);
    const modelRepository = AppDataSource.getRepository(MaturityModel);
    
    const campaign = await campaignRepository.findOne({
      where: { id: req.params.id },
      relations: ['maturityModel']
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Update maturity model if maturityModelId is provided
    if (maturityModelId && maturityModelId !== campaign.maturityModel.id) {
      const maturityModel = await modelRepository.findOne({
        where: { id: maturityModelId }
      });
      
      if (!maturityModel) {
        return res.status(404).json({ message: 'Maturity model not found' });
      }
      
      campaign.maturityModel = maturityModel;
    }
    
    if (name) campaign.name = name;
    if (description) campaign.description = description;
    if (startDate) campaign.startDate = new Date(startDate);
    if (endDate !== undefined) campaign.endDate = endDate ? new Date(endDate) : null;
    
    await campaignRepository.save(campaign);
    
    return res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return res.status(500).json({ message: 'Error updating campaign' });
  }
};

// Delete campaign (admin only)
export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const campaignRepository = AppDataSource.getRepository(Campaign);
    const campaign = await campaignRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    await campaignRepository.remove(campaign);
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return res.status(500).json({ message: 'Error deleting campaign' });
  }
};