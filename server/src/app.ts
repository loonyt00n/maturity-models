import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './config/database';
import { swaggerSpec } from './swagger';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import maturityModelRoutes from './routes/maturityModel.routes';
import serviceRoutes from './routes/service.routes';
import activityRoutes from './routes/activity.routes';
import journeyRoutes from './routes/journey.routes';
import campaignRoutes from './routes/campaign.routes';
import evaluationRoutes from './routes/evaluation.routes';
import { errorHandler } from './middlewares/errorHandler';
import { authenticateJwt } from './middlewares/auth';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// Serve swagger.json
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateJwt, userRoutes);
app.use('/api/maturity-models', authenticateJwt, maturityModelRoutes);
app.use('/api/services', authenticateJwt, serviceRoutes);
app.use('/api/activities', authenticateJwt, activityRoutes);
app.use('/api/journeys', authenticateJwt, journeyRoutes);
app.use('/api/campaigns', authenticateJwt, campaignRoutes);
app.use('/api/evaluations', authenticateJwt, evaluationRoutes);

// 404 Handler - Add before error handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

export default app;