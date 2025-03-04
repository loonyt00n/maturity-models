import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { MeasurementEvaluation } from './MeasurementEvaluation';
import { EvaluationStatus } from './MeasurementEvaluation';

export enum ChangeType {
  STATUS_CHANGE = 'status_change',
  EVIDENCE_UPDATE = 'evidence_update',
  NOTES_UPDATE = 'notes_update',
  VALIDATION_RESULT = 'validation_result'
}

@Entity('evaluation_history')
export class EvaluationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MeasurementEvaluation)
  evaluation: MeasurementEvaluation;

  @Column({ type: 'varchar' })
  changeType: ChangeType;

  @Column({ type: 'varchar', nullable: true })
  oldStatus: EvaluationStatus;

  @Column({ type: 'varchar', nullable: true })
  newStatus: EvaluationStatus;

  @Column({ type: 'text', nullable: true })
  previousValue: string;

  @Column({ type: 'text', nullable: true })
  newValue: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  validationResults: string;

  @ManyToOne(() => User, { nullable: true })
  changedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
