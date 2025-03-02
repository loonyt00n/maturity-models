import { Router } from 'express';
import { authorize } from '../middlewares/auth';
import { UserRole } from '../entities/User';
import {
  getAllActivities,
  getActivityById,
  getActivityServices,
  getActivityJourney,
  getActivityMaturitySummaries,
  createActivity,
  updateActivity,
  deleteActivity
} from '../controllers/activity.controller';

const router = Router();

// Get all activities
router.get('/', getAllActivities);

// Get activity by ID
router.get('/:id', getActivityById);

// Get activity services
router.get('/:id/services', getActivityServices);

// Get activity journey
router.get('/:id/journey', getActivityJourney);

// Get activity maturity summaries
router.get('/:id/maturity-summaries', getActivityMaturitySummaries);

// Create activity (admin/editor)
router.post('/', authorize([UserRole.ADMIN, UserRole.EDITOR]), createActivity);

// Update activity (admin/editor)
router.put('/:id', authorize([UserRole.ADMIN, UserRole.EDITOR]), updateActivity);

// Delete activity (admin only)
router.delete('/:id', authorize([UserRole.ADMIN]), deleteActivity);

export default router;

