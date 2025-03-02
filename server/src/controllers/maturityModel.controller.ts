// server/src/controllers/maturityModel.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { MaturityModel } from '../entities/MaturityModel';
import { Measurement } from '../entities/Measurement';
import { MaturityLevel } from '../entities/MaturityLevel';
import { Campaign } from '../entities/Campaign';

// Get all maturity models
export const getAllMaturityModels = async (req: Request, res: Response) => {
  try {
    const modelRepository = AppDataSource.getRepository(MaturityModel);
    const models = await modelRepository.find({
      relations: ['measurements']
    });
    
    return res.json(models);
  } catch (error) {
    console.error('Error fetching maturity models:', error);
    return res.status(500).json({ message: 'Error fetching maturity models' });
  }
};

// Get maturity model by ID
export const getMaturityModelById = async (req: Request, res: Response) => {
  try {
    const modelRepository = AppDataSource.getRepository(MaturityModel);
    const model = await modelRepository.findOne({
      where: { id: req.params.id },
      relations: ['measurements']
    });
    
    if (!model) {
      return res.status(404).json({ message: 'Maturity model not found' });
    }
    
    return res.json(model);
  } catch (error) {
    console.error('Error fetching maturity model:', error);
    return res.status(500).json({ message: 'Error fetching maturity model' });
  }
};

// Get maturity levels for a model
export const getMaturityLevelsByModelId = async (req: Request, res: Response) => {
  try {
    const levelRepository = AppDataSource.getRepository(MaturityLevel);
    const levels = await levelRepository.find({
      where: { maturityModel: { id: req.params.id } },
      order: { level: 'ASC' }
    });
    
    return res.json(levels);
  } catch (error) {
    console.error('Error fetching maturity levels:', error);
    return res.status(500).json({ message: 'Error fetching maturity levels' });
  }
};

// Get campaigns for a maturity model
export const getCampaignsByModelId = async (req: Request, res: Response) => {
  try {
    const campaignRepository = AppDataSource.getRepository(Campaign);
    const campaigns = await campaignRepository.find({
      where: { maturityModel: { id: req.params.id } }
    });
    
    return res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return res.status(500).json({ message: 'Error fetching campaigns' });
  }
};

// Create maturity model (admin only)
export const createMaturityModel = async (req: Request, res: Response) => {
  try {
    const { name, owner, description, measurements } = req.body;
    
    if (!name || !owner || !description) {
      return res.status(400).json({ message: 'Name, owner, and description are required' });
    }
    
    const modelRepository = AppDataSource.getRepository(MaturityModel);
    const measurementRepository = AppDataSource.getRepository(Measurement);
    
    // Create and save the maturity model first
    const newModel = new MaturityModel();
    newModel.name = name;
    newModel.owner = owner;
    newModel.description = description;
    
    const savedModel = await modelRepository.save(newModel);
    
    // Create and save measurements if provided
    if (measurements && Array.isArray(measurements)) {
      // Save each measurement individually
      for (const measurementData of measurements) {
        const measurement = new Measurement();
        measurement.name = measurementData.name;
        measurement.description = measurementData.description;
        measurement.evidenceType = measurementData.evidenceType;
        measurement.sampleEvidence = measurementData.sampleEvidence;
        measurement.maturityModel = savedModel;
        
        await measurementRepository.save(measurement);
      }
      
      // Reload model with measurements
      const modelWithMeasurements = await modelRepository.findOne({
        where: { id: savedModel.id },
        relations: ['measurements']
      });
      
      return res.status(201).json(modelWithMeasurements);
    }
    
    return res.status(201).json(savedModel);
  } catch (error) {
    console.error('Error creating maturity model:', error);
    return res.status(500).json({ message: 'Error creating maturity model' });
  }
};

// Update maturity model (admin only)
export const updateMaturityModel = async (req: Request, res: Response) => {
  try {
    const { name, owner, description } = req.body;
    
    const modelRepository = AppDataSource.getRepository(MaturityModel);
    const model = await modelRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!model) {
      return res.status(404).json({ message: 'Maturity model not found' });
    }
    
    if (name) model.name = name;
    if (owner) model.owner = owner;
    if (description) model.description = description;
    
    await modelRepository.save(model);
    
    // Return updated model with measurements
    const updatedModel = await modelRepository.findOne({
      where: { id: model.id },
      relations: ['measurements']
    });
    
    return res.json(updatedModel);
  } catch (error) {
    console.error('Error updating maturity model:', error);
    return res.status(500).json({ message: 'Error updating maturity model' });
  }
};

// Delete maturity model (admin only)
export const deleteMaturityModel = async (req: Request, res: Response) => {
  try {
    const modelRepository = AppDataSource.getRepository(MaturityModel);
    const model = await modelRepository.findOne({
      where: { id: req.params.id },
      relations: ['measurements']
    });
    
    if (!model) {
      return res.status(404).json({ message: 'Maturity model not found' });
    }
    
    await modelRepository.remove(model);
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting maturity model:', error);
    return res.status(500).json({ message: 'Error deleting maturity model' });
  }
};