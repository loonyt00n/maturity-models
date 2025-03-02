import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Activity } from './Activity';
import { MeasurementEvaluation } from './MeasurementEvaluation';

export enum ServiceType {
  API_SERVICE = 'api_service',
  UI_APPLICATION = 'ui_application',
  WORKFLOW = 'workflow',
  APPLICATION_MODULE = 'application_module'
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  owner!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar' })
  serviceType!: ServiceType;

  @Column({ type: 'varchar', nullable: true })
  resourceLocation!: string | null;

  @ManyToOne(() => Activity, activity => activity.services, { nullable: true })
  activity!: Activity | null;

  @OneToMany(() => MeasurementEvaluation, evaluation => evaluation.service)
  evaluations!: MeasurementEvaluation[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
