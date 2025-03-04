import { AppDataSource } from '../config/database';
import { EvaluationHistory, ChangeType } from '../entities/EvaluationHistory';
import { MeasurementEvaluation, EvaluationStatus } from '../entities/MeasurementEvaluation';
import { User } from '../entities/User';

/**
 * Create a new evaluation history record for status change
 */
export const createEvaluationHistory = async (
  evaluation: MeasurementEvaluation,
  oldStatus: EvaluationStatus,
  newStatus: EvaluationStatus,
  changedBy: User | undefined,
  changeReason?: string
): Promise<EvaluationHistory | null> => {
  try {
    // Ensure we have a valid user
    if (!changedBy) {
      console.error('Cannot create evaluation history: User is undefined');
      return null;
    }

    const historyRepository = AppDataSource.getRepository(EvaluationHistory);
    
    const history = new EvaluationHistory();
    history.evaluation = evaluation;
    history.changeType = ChangeType.STATUS_CHANGE;
    history.oldStatus = oldStatus;
    history.newStatus = newStatus;
    history.changedBy = changedBy;
    history.notes = changeReason || '';
    
    return await historyRepository.save(history);
  } catch (error) {
    console.error('Error creating evaluation history:', error);
    return null;
  }
};

/**
 * Create a history entry for evidence update
 */
export const createEvidenceUpdateHistory = async (
  evaluation: MeasurementEvaluation,
  previousValue: string,
  newValue: string,
  changedBy: User | undefined,
  notes?: string
): Promise<EvaluationHistory | null> => {
  try {
    if (!changedBy) {
      console.error('Cannot create evidence update history: User is undefined');
      return null;
    }

    const historyRepository = AppDataSource.getRepository(EvaluationHistory);
    
    const history = new EvaluationHistory();
    history.evaluation = evaluation;
    history.changeType = ChangeType.EVIDENCE_UPDATE;
    history.previousValue = previousValue;
    history.newValue = newValue;
    history.changedBy = changedBy;
    history.notes = notes || '';
    
    return await historyRepository.save(history);
  } catch (error) {
    console.error('Error creating evidence update history:', error);
    return null;
  }
};

/**
 * Create a history entry for notes update
 */
export const createNotesUpdateHistory = async (
  evaluation: MeasurementEvaluation,
  previousNotes: string,
  newNotes: string,
  changedBy: User | undefined
): Promise<EvaluationHistory | null> => {
  try {
    if (!changedBy) {
      console.error('Cannot create notes update history: User is undefined');
      return null;
    }

    const historyRepository = AppDataSource.getRepository(EvaluationHistory);
    
    const history = new EvaluationHistory();
    history.evaluation = evaluation;
    history.changeType = ChangeType.NOTES_UPDATE;
    history.previousValue = previousNotes;
    history.newValue = newNotes;
    history.changedBy = changedBy;
    
    return await historyRepository.save(history);
  } catch (error) {
    console.error('Error creating notes update history:', error);
    return null;
  }
};

/**
 * Create a history entry for validation results
 */
export const createValidationResultHistory = async (
  evaluation: MeasurementEvaluation,
  oldStatus: EvaluationStatus,
  newStatus: EvaluationStatus,
  validationResults: string,
  user?: User
): Promise<EvaluationHistory | null> => {
  try {
    const historyRepository = AppDataSource.getRepository(EvaluationHistory);
    
    const history = new EvaluationHistory();
    history.evaluation = evaluation;
    history.changeType = ChangeType.VALIDATION_RESULT;
    history.oldStatus = oldStatus;
    history.newStatus = newStatus;
    history.validationResults = validationResults;
    history.notes = 'Automated validation process';
    
    // If user is provided, use it; otherwise, it will be null (system process)
    if (user) {
      history.changedBy = user;
    }
    
    return await historyRepository.save(history);
  } catch (error) {
    console.error('Error creating validation result history:', error);
    return null;
  }
};

/**
 * Get evaluation history for a specific evaluation
 */
export const getEvaluationHistory = async (evaluationId: string): Promise<EvaluationHistory[]> => {
  try {
    const historyRepository = AppDataSource.getRepository(EvaluationHistory);
    
    return await historyRepository.find({
      where: { evaluation: { id: evaluationId } },
      relations: ['changedBy', 'evaluation'],
      order: { createdAt: 'DESC' }
    });
  } catch (error) {
    console.error('Error fetching evaluation history:', error);
    return [];
  }
};
