import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { MeasurementEvaluation } from './MeasurementEvaluation';
import { EvaluationStatus } from './MeasurementEvaluation';

@Entity('evaluation_history')
export class EvaluationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MeasurementEvaluation)
  evaluation: MeasurementEvaluation;

  @Column({ type: 'varchar' })
  oldStatus: EvaluationStatus;

  @Column({ type: 'varchar' })
  newStatus: EvaluationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, { nullable: false })
  changedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
