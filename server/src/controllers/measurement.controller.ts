import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Measurement, EvidenceType } from '../entities/Measurement';
import { MaturityModel } from '../entities/MaturityModel';

// Create a new measurement
export const createMeasurement = async (req: Request, res: Response) => {
  try {
    const { name, description, evidenceType, sampleEvidence, maturityModelId } = req.body;
    
    if (!name || !description || !evidenceType || !maturityModelId) {
      return res.status(400).json({ message: 'Name, description, evidenceType, and maturityModelId are required' });
    }
    
    const measurementRepository = AppDataSource.getRepository(Measurement);
    const modelRepository = AppDataSource.getRepository(MaturityModel);
    
    // Check if maturity model exists
    const maturityModel = await modelRepository.findOne({ where: { id: maturityModelId } });
    
    if (!maturityModel) {
      return res.status(404).json({ message: 'Maturity model not found' });
    }
    
    // Create new measurement
    const newMeasurement = new Measurement();
    newMeasurement.name = name;
    newMeasurement.description = description;
    newMeasurement.evidenceType = evidenceType as EvidenceType;
    newMeasurement.sampleEvidence = sampleEvidence;
    newMeasurement.maturityModel = maturityModel;
    
    const savedMeasurement = await measurementRepository.save(newMeasurement);
    
    return res.status(201).json(savedMeasurement);
  } catch (error) {
    console.error('Error creating measurement:', error);
    return res.status(500).json({ message: 'Error creating measurement' });
  }
};

// Get measurement by ID
export const getMeasurementById = async (req: Request, res: Response) => {
  try {
    const measurementRepository = AppDataSource.getRepository(Measurement);
    const measurement = await measurementRepository.findOne({
      where: { id: req.params.id },
      relations: ['maturityModel']
    });
    
    if (!measurement) {
      return res.status(404).json({ message: 'Measurement not found' });
    }
    
    return res.json(measurement);
  } catch (error) {
    console.error('Error fetching measurement:', error);
    return res.status(500).json({ message: 'Error fetching measurement' });
  }
};

// Update measurement
export const updateMeasurement = async (req: Request, res: Response) => {
  try {
    const { name, description, evidenceType, sampleEvidence } = req.body;
    
    const measurementRepository = AppDataSource.getRepository(Measurement);
    const measurement = await measurementRepository.findOne({
      where: { id: req.params.id },
      relations: ['maturityModel']
    });
    
    if (!measurement) {
      return res.status(404).json({ message: 'Measurement not found' });
    }
    
    // Update fields if provided
    if (name) measurement.name = name;
    if (description) measurement.description = description;
    if (evidenceType) measurement.evidenceType = evidenceType as EvidenceType;
    if (sampleEvidence !== undefined) measurement.sampleEvidence = sampleEvidence;
    
    await measurementRepository.save(measurement);
    
    return res.json(measurement);
  } catch (error) {
    console.error('Error updating measurement:', error);
    return res.status(500).json({ message: 'Error updating measurement' });
  }
};

// Delete measurement
export const deleteMeasurement = async (req: Request, res: Response) => {
  try {
    const measurementRepository = AppDataSource.getRepository(Measurement);
    const measurement = await measurementRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!measurement) {
      return res.status(404).json({ message: 'Measurement not found' });
    }
    
    await measurementRepository.remove(measurement);
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting measurement:', error);
    return res.status(500).json({ message: 'Error deleting measurement' });
  }
};
