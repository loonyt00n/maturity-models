import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MaturityModel } from './MaturityModel';
import { MeasurementEvaluation } from './MeasurementEvaluation';

export enum EvidenceType {
  URL = 'url',
  DOCUMENT = 'document',
  IMAGE = 'image',
  TEXT = 'text'
}

@Entity('measurements')
export class Measurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  evidenceType: EvidenceType;

  @Column({ type: 'varchar', nullable: true })
  sampleEvidence: string;

  @ManyToOne(() => MaturityModel, model => model.measurements)
  maturityModel: MaturityModel;

  @OneToMany(() => MeasurementEvaluation, evaluation => evaluation.measurement)
  evaluations: MeasurementEvaluation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
