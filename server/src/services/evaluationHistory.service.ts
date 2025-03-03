import { AppDataSource } from '../config/database';
import { EvaluationHistory } from '../entities/EvaluationHistory';
import { MeasurementEvaluation, EvaluationStatus } from '../entities/MeasurementEvaluation';
import { User } from '../entities/User';

/**
 * Create a new evaluation history record
 */
export const createEvaluationHistory = async (
  evaluation: MeasurementEvaluation,
  oldStatus: EvaluationStatus,
  newStatus: EvaluationStatus,
  changedBy: User | undefined,
  notes?: string
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
    history.oldStatus = oldStatus;
    history.newStatus = newStatus;
    history.changedBy = changedBy; // This is now safe because we checked for undefined
    history.notes = notes || '';
    
    return await historyRepository.save(history);
  } catch (error) {
    console.error('Error creating evaluation history:', error);
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
