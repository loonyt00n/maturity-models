
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { MaturityModel } from '../entities/MaturityModel';
import { Service } from '../entities/Service';
import { Activity } from '../entities/Activity';
import { Journey } from '../entities/Journey';
import { Campaign } from '../entities/Campaign';
import { MeasurementEvaluation, EvaluationStatus } from '../entities/MeasurementEvaluation';

// Get system statistics
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const modelRepository = AppDataSource.getRepository(MaturityModel);
    const serviceRepository = AppDataSource.getRepository(Service);
    const activityRepository = AppDataSource.getRepository(Activity);
    const journeyRepository = AppDataSource.getRepository(Journey);
    const campaignRepository = AppDataSource.getRepository(Campaign);
    
    const [
      userCount,
      maturityModelCount,
      serviceCount,
      activityCount,
      journeyCount,
      campaignCount
    ] = await Promise.all([
      userRepository.count(),
      modelRepository.count(),
      serviceRepository.count(),
      activityRepository.count(),
      journeyRepository.count(),
      campaignRepository.count()
    ]);
    
    return res.json({
      userCount,
      maturityModelCount,
      serviceCount,
      activityCount,
      journeyCount,
      campaignCount
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return res.status(500).json({ message: 'Error fetching system stats' });
  }
};

// Get recent users
export const getRecentUsers = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    const users = await userRepository.find({
      select: ['id', 'username', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      order: {
        createdAt: 'DESC'
      },
      take: 10 // Get the 10 most recent users
    });
    
    return res.json(users);
  } catch (error) {
    console.error('Error fetching recent users:', error);
    return res.status(500).json({ message: 'Error fetching recent users' });
  }
};

// Get all users for admin
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    const users = await userRepository.find({
      select: ['id', 'username', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      order: {
        name: 'ASC'
      }
    });
    
    return res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    return res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get distribution data
export const getDistributions = async (req: Request, res: Response) => {
  try {
    // Get role distribution
    const userRepository = AppDataSource.getRepository(User);
    const serviceRepository = AppDataSource.getRepository(Service);
    const evaluationRepository = AppDataSource.getRepository(MeasurementEvaluation);
    
    // Count users by role
    const users = await userRepository.find();
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const roleDistribution = Object.entries(roleCounts).map(([name, value]) => ({
      name,
      value
    }));
    
    // Get maturity level distribution
    const services = await serviceRepository.find();
    const maturityLevelCounts = [0, 0, 0, 0, 0]; // Levels 0-4
    
    // For each service, get its maturity level
    for (const service of services) {
      const evaluations = await evaluationRepository.find({
        where: { service: { id: service.id } }
      });
      
      if (evaluations.length === 0) {
        maturityLevelCounts[0]++; // Level 0 if no evaluations
        continue;
      }
      
      const implementedCount = evaluations.filter(
        e => e.status === EvaluationStatus.IMPLEMENTED
      ).length;
      
      const percentage = (implementedCount / evaluations.length) * 100;
      
      // Determine maturity level based on percentage
      let level = 0;
      if (percentage >= 100) level = 4;
      else if (percentage >= 75) level = 3;
      else if (percentage >= 50) level = 2;
      else if (percentage >= 25) level = 1;
      
      maturityLevelCounts[level]++;
    }
    
    // Calculate total services for percentage calculation
    const totalServices = services.length;
    const maturityDistribution = maturityLevelCounts.map((count, level) => ({
      level,
      count,
      percentage: totalServices > 0 ? (count / totalServices) * 100 : 0
    }));
    
    return res.json({
      roleDistribution,
      maturityDistribution
    });
  } catch (error) {
    console.error('Error fetching distributions:', error);
    return res.status(500).json({ message: 'Error fetching distributions' });
  }
};
