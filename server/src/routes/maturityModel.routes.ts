import { Router } from 'express';
import { authorize } from '../middlewares/auth';
import { UserRole } from '../entities/User';
import {
  getAllMaturityModels,
  getMaturityModelById,
  getMaturityLevelsByModelId,
  getCampaignsByModelId,
  createMaturityModel,
  updateMaturityModel,
  deleteMaturityModel
} from '../controllers/maturityModel.controller';

const router = Router();

// Get all maturity models
router.get('/', getAllMaturityModels);

// Get maturity model by ID
router.get('/:id', getMaturityModelById);

// Get maturity levels for a model
router.get('/:id/levels', getMaturityLevelsByModelId);

// Get campaigns for a maturity model
router.get('/:id/campaigns', getCampaignsByModelId);

// Create maturity model (admin only)
router.post('/', authorize([UserRole.ADMIN]), createMaturityModel);

// Update maturity model (admin only)
router.put('/:id', authorize([UserRole.ADMIN]), updateMaturityModel);

// Delete maturity model (admin only)
router.delete('/:id', authorize([UserRole.ADMIN]), deleteMaturityModel);

export default router;

