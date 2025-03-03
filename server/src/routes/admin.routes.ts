
import { Router } from 'express';
import { authorize } from '../middlewares/auth';
import { UserRole } from '../entities/User';
import {
  getSystemStats,
  getRecentUsers,
  getAllUsers,
  getDistributions
} from '../controllers/admin.controller';

const router = Router();

// Ensure all admin routes are protected
router.use(authorize([UserRole.ADMIN]));

// Get system statistics
router.get('/stats', getSystemStats);

// Get recent users
router.get('/recent-users', getRecentUsers);

// Get all users
router.get('/users', getAllUsers);

// Get distributions (role and maturity level)
router.get('/distributions', getDistributions);

export default router;
