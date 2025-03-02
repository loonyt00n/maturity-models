import { Router } from 'express';
import { authorize } from '../middlewares/auth';
import { UserRole } from '../entities/User';
import {
  getAllServices,
  getServiceById,
  getServiceCampaigns,
  createService,
  updateService,
  deleteService
} from '../controllers/service.controller';

const router = Router();

// Get all services
router.get('/', getAllServices);

// Get service by ID
router.get('/:id', getServiceById);

// Get service campaigns and evaluations
router.get('/:id/campaigns', getServiceCampaigns);

// Create service (admin/editor)
router.post('/', authorize([UserRole.ADMIN, UserRole.EDITOR]), createService);

// Update service (admin/editor)
router.put('/:id', authorize([UserRole.ADMIN, UserRole.EDITOR]), updateService);

// Delete service (admin only)
router.delete('/:id', authorize([UserRole.ADMIN]), deleteService);

export default router;

