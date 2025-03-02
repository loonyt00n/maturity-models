import { Router } from 'express';
import { authorize } from '../middlewares/auth';
import { UserRole } from '../entities/User';
import {
  getAllCampaigns,
  getCampaignById,
  getCampaignResults,
  createCampaign,
  updateCampaign,
  deleteCampaign
} from '../controllers/campaign.controller';

const router = Router();

// Get all campaigns
router.get('/', getAllCampaigns);

// Get campaign by ID
router.get('/:id', getCampaignById);

// Get campaign results
router.get('/:id/results', getCampaignResults);

// Create campaign (admin/editor)
router.post('/', authorize([UserRole.ADMIN, UserRole.EDITOR]), createCampaign);

// Update campaign (admin/editor)
router.put('/:id', authorize([UserRole.ADMIN, UserRole.EDITOR]), updateCampaign);

// Delete campaign (admin only)
router.delete('/:id', authorize([UserRole.ADMIN]), deleteCampaign);

export default router;

