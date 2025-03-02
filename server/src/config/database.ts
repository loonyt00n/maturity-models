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
    MaturityLevel
  ],
  synchronize: true, // Set to false in production
  logging: true,
});

