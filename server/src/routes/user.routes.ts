import { Router } from 'express';
import { authorize } from '../middlewares/auth';
import { UserRole } from '../entities/User';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller';

const router = Router();

// Get all users (admin only)
router.get('/', authorize([UserRole.ADMIN]), getAllUsers);

// Get user by ID (admin only)
router.get('/:id', authorize([UserRole.ADMIN]), getUserById);

// Create user (admin only)
router.post('/', authorize([UserRole.ADMIN]), createUser);

// Update user (admin only)
router.put('/:id', authorize([UserRole.ADMIN]), updateUser);

// Delete user (admin only)
router.delete('/:id', authorize([UserRole.ADMIN]), deleteUser);

export default router;

