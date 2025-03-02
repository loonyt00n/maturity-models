import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      select: ['id', 'username', 'name', 'email', 'role', 'createdAt', 'updatedAt']
    });
    
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ 
      where: { id: req.params.id },
      select: ['id', 'username', 'name', 'email', 'role', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Error fetching user' });
  }
};

// Create user (admin only)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, name, email, role } = req.body;
    
    if (!username || !password || !name) {
      return res.status(400).json({ message: 'Username, password, and name are required' });
    }
    
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { username } });
    
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = userRepository.create({
      username,
      password: hashedPassword,
      name,
      email,
      role: role || UserRole.VIEWER // Default to VIEWER if no role specified
    });
    
    await userRepository.save(newUser);
    
    return res.status(201).json({ 
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Error creating user' });
  }
};

// Update user (admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { username, name, email, role } = req.body;
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.params.id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if username is being changed and already exists
    if (username && username !== user.username) {
      const existingUser = await userRepository.findOne({ where: { username } });
      
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      user.username = username;
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    
    await userRepository.save(user);
    
    return res.json({ 
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.params.id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if this is the last admin user
    if (user.role === UserRole.ADMIN) {
      const adminCount = await userRepository.count({ where: { role: UserRole.ADMIN } });
      
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }
    
    await userRepository.remove(user);
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Error deleting user' });
  }
};
