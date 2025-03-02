import { Router } from 'express';
import { authorize } from '../middlewares/auth';
import { UserRole } from '../entities/User';
import {
  getAllJourneys,
  getJourneyById,
  getJourneyActivities,
  getJourneyMaturitySummaries,
  createJourney,
  updateJourney,
  deleteJourney
} from '../controllers/journey.controller';

const router = Router();

// Get all journeys
router.get('/', getAllJourneys);

// Get journey by ID
router.get('/:id', getJourneyById);

// Get journey activities
router.get('/:id/activities', getJourneyActivities);

// Get journey maturity summaries
router.get('/:id/maturity-summaries', getJourneyMaturitySummaries);

// Create journey (admin/editor)
router.post('/', authorize([UserRole.ADMIN, UserRole.EDITOR]), createJourney);

// Update journey (admin/editor)
router.put('/:id', authorize([UserRole.ADMIN, UserRole.EDITOR]), updateJourney);

// Delete journey (admin only)
router.delete('/:id', authorize([UserRole.ADMIN]), deleteJourney);

export default router;

