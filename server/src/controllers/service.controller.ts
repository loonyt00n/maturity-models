// server/src/controllers/service.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Service } from '../entities/Service';
import { Activity } from '../entities/Activity';
import { Campaign } from '../entities/Campaign';
import { MeasurementEvaluation } from '../entities/MeasurementEvaluation';
import { MaturityModel } from '../entities/MaturityModel';

// Get all services
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const serviceRepository = AppDataSource.getRepository(Service);
    const services = await serviceRepository.find();
    
    return res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({ message: 'Error fetching services' });
  }
};

// Get service by ID
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const serviceRepository = AppDataSource.getRepository(Service);
    const service = await serviceRepository.findOne({
      where: { id: req.params.id },
      relations: ['activity']
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    return res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return res.status(500).json({ message: 'Error fetching service' });
  }
};

// Get service campaigns and evaluations
export const getServiceCampaigns = async (req: Request, res: Response) => {
  try {
    const serviceRepository = AppDataSource.getRepository(Service);
    const evaluationRepository = AppDataSource.getRepository(MeasurementEvaluation);
    const campaignRepository = AppDataSource.getRepository(Campaign);
    
    const service = await serviceRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Get evaluations for this service
    const evaluations = await evaluationRepository.find({
      where: { service: { id: service.id } },
      relations: ['campaign', 'measurement']
    });
    
    // Group evaluations by campaign
    const campaignMap = new Map();
    
    for (const evaluation of evaluations) {
      const campaignId = evaluation.campaign.id;
      
      if (!campaignMap.has(campaignId)) {
        const campaign = await campaignRepository.findOne({
          where: { id: campaignId },
          relations: ['maturityModel']
        });
        
        campaignMap.set(campaignId, {
          campaign: campaign,
          maturityModel: campaign?.maturityModel,
          evaluations: []
        });
      }
      
      campaignMap.get(campaignId).evaluations.push(evaluation);
    }
    
    // Calculate maturity level for each campaign
    const result = [];
    
    for (const [_, data] of campaignMap) {
      const totalMeasurements = data.evaluations.length;
      const implementedMeasurements = data.evaluations.filter((e: MeasurementEvaluation) => e.status === 'implemented').length;
      const percentage = totalMeasurements > 0 ? (implementedMeasurements / totalMeasurements) * 100 : 0;
      
      // Determine maturity level based on percentage
      let maturityLevel = 0;
      if (percentage >= 100) maturityLevel = 4;
      else if (percentage >= 75) maturityLevel = 3;
      else if (percentage >= 50) maturityLevel = 2;
      else if (percentage >= 25) maturityLevel = 1;
      
      result.push({
        campaign: data.campaign,
        maturityModel: data.maturityModel,
        maturityLevel,
        percentage,
        evaluations: data.evaluations
      });
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching service campaigns:', error);
    return res.status(500).json({ message: 'Error fetching service campaigns' });
  }
};

// Create service (admin/editor)
export const createService = async (req: Request, res: Response) => {
  try {
    const { name, owner, description, serviceType, resourceLocation, activityId } = req.body;
    
    if (!name || !owner || !description || !serviceType) {
      return res.status(400).json({ message: 'Name, owner, description, and serviceType are required' });
    }
    
    const serviceRepository = AppDataSource.getRepository(Service);
    const activityRepository = AppDataSource.getRepository(Activity);
    
    // Check if activity exists if activityId is provided
    let activity: Activity | null = null;
    if (activityId) {
      activity = await activityRepository.findOne({ where: { id: activityId } });
      
      if (!activity) {
        return res.status(404).json({ message: 'Activity not found' });
      }
    }
    
    // Create new service using the constructor approach
    const newService = new Service();
    newService.name = name;
    newService.owner = owner;
    newService.description = description;
    newService.serviceType = serviceType;
    newService.resourceLocation = resourceLocation;
    newService.activity = activity;
    
    const savedService = await serviceRepository.save(newService);
    
    return res.status(201).json(savedService);
  } catch (error) {
    console.error('Error creating service:', error);
    return res.status(500).json({ message: 'Error creating service' });
  }
};

// Update service (admin/editor)
export const updateService = async (req: Request, res: Response) => {
  try {
    const { name, owner, description, serviceType, resourceLocation, activityId } = req.body;
    
    const serviceRepository = AppDataSource.getRepository(Service);
    const activityRepository = AppDataSource.getRepository(Activity);
    
    const service = await serviceRepository.findOne({
      where: { id: req.params.id },
      relations: ['activity']
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Update activity if activityId is provided
    if (activityId !== undefined) {
      if (activityId) {
        const activity = await activityRepository.findOne({ where: { id: activityId } });
        
        if (!activity) {
          return res.status(404).json({ message: 'Activity not found' });
        }
        
        service.activity = activity;
      } else {
        // If activityId is null or empty string, set activity to null
        // Make sure your Service entity allows activity to be nullable
        service.activity = null;
      }
    }
    
    if (name) service.name = name;
    if (owner) service.owner = owner;
    if (description) service.description = description;
    if (serviceType) service.serviceType = serviceType;
    if (resourceLocation !== undefined) service.resourceLocation = resourceLocation;
    
    await serviceRepository.save(service);
    
    return res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return res.status(500).json({ message: 'Error updating service' });
  }
};

// Delete service (admin only)
export const deleteService = async (req: Request, res: Response) => {
  try {
    const serviceRepository = AppDataSource.getRepository(Service);
    const service = await serviceRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    await serviceRepository.remove(service);
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({ message: 'Error deleting service' });
  }
};