import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { MeasurementEvaluation, EvaluationStatus } from '../entities/MeasurementEvaluation';
import { EvaluationHistory } from '../entities/EvaluationHistory';
import { Service } from '../entities/Service';
import { Campaign } from '../entities/Campaign';
import { Measurement } from '../entities/Measurement';
import { 
  createEvaluationHistory, 
  createEvidenceUpdateHistory, 
  createNotesUpdateHistory 
} from '../services/evaluationHistory.service';
import { EvidenceValidator } from '../services/EvidenceValidator';


// Get maturity level distribution
export const getMaturityLevelDistribution = async (req: Request, res: Response) => {
  try {
    const serviceRepository = AppDataSource.getRepository(Service);
    const evaluationRepository = AppDataSource.getRepository(MeasurementEvaluation);
    
    // Get all services
    const services = await serviceRepository.find();
    
    if (services.length === 0) {
      return res.json([
        { level: 'Level 0', count: 0 },
        { level: 'Level 1', count: 0 },
        { level: 'Level 2', count: 0 },
        { level: 'Level 3', count: 0 },
        { level: 'Level 4', count: 0 }
      ]);
    }
    
    // Initialize level counts
    const levelCounts = [0, 0, 0, 0, 0]; // Level 0-4
    
    // For each service, calculate its maturity level
    for (const service of services) {
      const evaluations = await evaluationRepository.find({
        where: { service: { id: service.id } }
      });
      
      if (evaluations.length === 0) {
        levelCounts[0]++; // Level 0 if no evaluations
        continue;
      }
      
      const implementedCount = evaluations.filter(e => e.status === EvaluationStatus.IMPLEMENTED).length;
      const percentage = (implementedCount / evaluations.length) * 100;
      
      // Determine maturity level based on percentage
      let level = 0;
      if (percentage >= 100) level = 4;
      else if (percentage >= 75) level = 3;
      else if (percentage >= 50) level = 2;
      else if (percentage >= 25) level = 1;
      
      levelCounts[level]++;
    }
    
    // Format the response
    return res.json([
      { level: 'Level 0', count: levelCounts[0] },
      { level: 'Level 1', count: levelCounts[1] },
      { level: 'Level 2', count: levelCounts[2] },
      { level: 'Level 3', count: levelCounts[3] },
      { level: 'Level 4', count: levelCounts[4] }
    ]);
  } catch (error) {
    console.error('Error fetching maturity level distribution:', error);
    return res.status(500).json({ message: 'Error fetching maturity level distribution' });
  }
};

// Get evaluation by ID
export const getEvaluationById = async (req: Request, res: Response) => {
  try {
    const evaluationRepository = AppDataSource.getRepository(MeasurementEvaluation);
    const evaluation = await evaluationRepository.findOne({
      where: { id: req.params.id },
      relations: ['service', 'measurement', 'campaign']
    });
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    return res.json(evaluation);
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return res.status(500).json({ message: 'Error fetching evaluation' });
  }
};

// Get evaluation history
export const getEvaluationHistoryById = async (req: Request, res: Response) => {
  try {
    const historyRepository = AppDataSource.getRepository(EvaluationHistory);
    
    const history = await historyRepository.find({
      where: { evaluation: { id: req.params.id } },
      relations: ['changedBy'],
      order: { createdAt: 'DESC' }
    });
    
    return res.json(history);
  } catch (error) {
    console.error('Error fetching evaluation history:', error);
    return res.status(500).json({ message: 'Error fetching evaluation history' });
  }
};

// Update evaluation status (admin only)
export const updateEvaluationStatus = async (req: Request, res: Response) => {
  try {
    const { status, changeReason } = req.body;
    
    if (!status || !Object.values(EvaluationStatus).includes(status as EvaluationStatus)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }
    
    const evaluationRepository = AppDataSource.getRepository(MeasurementEvaluation);
    const evaluation = await evaluationRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    // Store the old status before updating
    const oldStatus = evaluation.status;
    
    // Update the status
    evaluation.status = status as EvaluationStatus;
    
    await evaluationRepository.save(evaluation);
    
    // Create a history record, only if the user is defined
    if (req.user) {
      await createEvaluationHistory(
        evaluation,
        oldStatus,
        status as EvaluationStatus,
        req.user,
        changeReason
      );
    }
    
    // If status is changed to validating_evidence, trigger validation process
    if (status === EvaluationStatus.VALIDATING_EVIDENCE) {
      // Run validation asynchronously to not block the response
      setTimeout(async () => {
        try {
          await EvidenceValidator.validateEvidence(evaluation);
          console.log(`Validation completed for evaluation ${evaluation.id}`);
        } catch (error) {
          console.error(`Error during validation for evaluation ${evaluation.id}:`, error);
        }
      }, 100);
    }
    
    return res.json(evaluation);
  } catch (error) {
    console.error('Error updating evaluation status:', error);
    return res.status(500).json({ message: 'Error updating evaluation status' });
  }
};

// Submit evidence for evaluation (admin/editor)
export const submitEvidence = async (req: Request, res: Response) => {
  try {
    const { evidenceLocation, notes } = req.body;
    
    if (!evidenceLocation) {
      return res.status(400).json({ message: 'Evidence location is required' });
    }
    
    const evaluationRepository = AppDataSource.getRepository(MeasurementEvaluation);
    const evaluation = await evaluationRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    // Store current values for history
    const previousEvidenceLocation = evaluation.evidenceLocation || '';
    const previousNotes = evaluation.notes || '';
    const oldStatus = evaluation.status;
    
    // Update evaluation
    evaluation.evidenceLocation = evidenceLocation;
    if (notes !== undefined) evaluation.notes = notes;
    evaluation.status = EvaluationStatus.EVIDENCE_SUBMITTED;
    
    await evaluationRepository.save(evaluation);
    
    // Create evidence update history
    if (req.user && evidenceLocation !== previousEvidenceLocation) {
      await createEvidenceUpdateHistory(
        evaluation,
        previousEvidenceLocation,
        evidenceLocation,
        req.user,
        notes
      );
    }
    
    // Create notes update history if notes changed
    if (req.user && notes && notes !== previousNotes) {
      await createNotesUpdateHistory(
        evaluation,
        previousNotes,
        notes,
        req.user
      );
    }
    
    // Create status change history if status changed
    if (req.user && oldStatus !== evaluation.status) {
      await createEvaluationHistory(
        evaluation,
        oldStatus,
        evaluation.status,
        req.user,
        'Evidence submitted'
      );
    }
    
    return res.json(evaluation);
  } catch (error) {
    console.error('Error submitting evidence:', error);
    return res.status(500).json({ message: 'Error submitting evidence' });
  }
};


// Create or update evaluation for service in campaign
export const createOrUpdateEvaluation = async (req: Request, res: Response) => {
  try {
    const { serviceId, measurementId, campaignId, status, evidenceLocation, notes } = req.body;
    
    if (!serviceId || !measurementId || !campaignId || !status) {
      return res.status(400).json({ message: 'ServiceId, measurementId, campaignId, and status are required' });
    }
    
    const evaluationRepository = AppDataSource.getRepository(MeasurementEvaluation);
    const serviceRepository = AppDataSource.getRepository(Service);
    const campaignRepository = AppDataSource.getRepository(Campaign);
    const measurementRepository = AppDataSource.getRepository(Measurement);
    
    // Check if all referenced entities exist
    const service = await serviceRepository.findOne({ where: { id: serviceId } });
    const campaign = await campaignRepository.findOne({ where: { id: campaignId } });
    const measurement = await measurementRepository.findOne({ where: { id: measurementId } });
    
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (!measurement) return res.status(404).json({ message: 'Measurement not found' });
    
    // Check if evaluation already exists
    let evaluation = await evaluationRepository.findOne({
      where: {
        service: { id: serviceId },
        measurement: { id: measurementId },
        campaign: { id: campaignId }
      }
    });
    
    let oldStatus = EvaluationStatus.NOT_IMPLEMENTED;
    let isNewEvaluation = false;
    
    if (evaluation) {
      // Save old status for history
      oldStatus = evaluation.status;
      
      // Update existing evaluation
      evaluation.status = status as EvaluationStatus;
      if (evidenceLocation !== undefined) evaluation.evidenceLocation = evidenceLocation;
      if (notes !== undefined) evaluation.notes = notes;
    } else {
      // Create new evaluation using constructor approach
      isNewEvaluation = true;
      evaluation = new MeasurementEvaluation();
      evaluation.service = service;
      evaluation.measurement = measurement;
      evaluation.campaign = campaign;
      evaluation.status = status as EvaluationStatus;
      evaluation.evidenceLocation = evidenceLocation;
      evaluation.notes = notes;
    }
    
    const savedEvaluation = await evaluationRepository.save(evaluation);
    
    // Create history record if user is available and status changed or new evaluation
    if (req.user && (oldStatus !== status as EvaluationStatus || isNewEvaluation)) {
      await createEvaluationHistory(
        savedEvaluation,
        oldStatus,
        status as EvaluationStatus,
        req.user,
        notes
      );
    }
    
    return res.status(isNewEvaluation ? 201 : 200).json(savedEvaluation);
  } catch (error) {
    console.error('Error creating/updating evaluation:', error);
    return res.status(500).json({ message: 'Error creating/updating evaluation' });
  }
};
