import { Router } from 'express';
import { authorize } from '../middlewares/auth';
import { UserRole } from '../entities/User';
import {
  getMaturityLevelDistribution,
  getEvaluationById,
  submitEvidence,
  updateEvaluationStatus,
  createOrUpdateEvaluation
} from '../controllers/evaluation.controller';

const router = Router();

// Get maturity level distribution
router.get('/distribution', getMaturityLevelDistribution);

// Get evaluation by ID
router.get('/:id', getEvaluationById);

// Submit evidence (admin/editor)
router.post('/:id/evidence', authorize([UserRole.ADMIN, UserRole.EDITOR]), submitEvidence);

// Update evaluation status (admin only)
router.put('/:id/status', authorize([UserRole.ADMIN]), updateEvaluationStatus);

// Create or update evaluation
router.post('/', authorize([UserRole.ADMIN, UserRole.EDITOR]), createOrUpdateEvaluation);

export default router;
