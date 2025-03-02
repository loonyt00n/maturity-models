import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Measurement } from './Measurement';
import { Service } from './Service';
import { Campaign } from './Campaign';

export enum EvaluationStatus {
  NOT_IMPLEMENTED = 'not_implemented',
  EVIDENCE_SUBMITTED = 'evidence_submitted',
  VALIDATING_EVIDENCE = 'validating_evidence',
  EVIDENCE_REJECTED = 'evidence_rejected',
  IMPLEMENTED = 'implemented'
}

@Entity('measurement_evaluations')
export class MeasurementEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Measurement, measurement => measurement.evaluations)
  measurement: Measurement;

  @ManyToOne(() => Service, service => service.evaluations)
  service: Service;

  @ManyToOne(() => Campaign, campaign => campaign.evaluations)
  campaign: Campaign;

  @Column({ type: 'varchar', default: EvaluationStatus.NOT_IMPLEMENTED })
  status: EvaluationStatus;

  @Column({ type: 'text', nullable: true })
  evidenceLocation: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

