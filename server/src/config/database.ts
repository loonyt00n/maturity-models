import { DataSource } from 'typeorm';
import path from 'path';
import { User } from '../entities/User';
import { MaturityModel } from '../entities/MaturityModel';
import { Measurement } from '../entities/Measurement';
import { Service } from '../entities/Service';
import { Activity } from '../entities/Activity';
import { Journey } from '../entities/Journey';
import { MeasurementEvaluation } from '../entities/MeasurementEvaluation';
import { Campaign } from '../entities/Campaign';
import { MaturityLevel } from '../entities/MaturityLevel';
import { EvaluationHistory } from '../entities/EvaluationHistory';

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.resolve(__dirname, '../../database.sqlite'),
  entities: [
    User,
    MaturityModel,
    Measurement,
    Service,
    Activity,
    Journey,
    MeasurementEvaluation,
    Campaign,
    MaturityLevel,
    EvaluationHistory
  ],
  synchronize: !isProduction, // Only sync in non-production environments
  logging: !isProduction, // Only log in non-production environments
});
