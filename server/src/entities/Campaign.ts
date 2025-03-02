import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MaturityModel } from './MaturityModel';
import { MeasurementEvaluation } from './MeasurementEvaluation';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  startDate!: Date;

  @Column({ nullable: true })
  endDate!: Date | null;

  @ManyToOne(() => MaturityModel)
  maturityModel!: MaturityModel;

  @OneToMany(() => MeasurementEvaluation, evaluation => evaluation.campaign, { cascade: true })
  evaluations!: MeasurementEvaluation[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
