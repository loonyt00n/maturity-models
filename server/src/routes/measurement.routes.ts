import { Router } from 'express';
import { authorize } from '../middlewares/auth';
import { UserRole } from '../entities/User';
import {
  getMeasurementById,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement
} from '../controllers/measurement.controller';

const router = Router();

// Get measurement by ID
router.get('/:id', getMeasurementById);

// Create measurement (admin only)
router.post('/', authorize([UserRole.ADMIN]), createMeasurement);

// Update measurement (admin only)
router.put('/:id', authorize([UserRole.ADMIN]), updateMeasurement);

// Delete measurement (admin only)
router.delete('/:id', authorize([UserRole.ADMIN]), deleteMeasurement);

export default router;
