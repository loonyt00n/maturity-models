import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Measurement } from './Measurement';

@Entity('maturity_models')
export class MaturityModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  owner: string;

  @Column({ type: 'text' })
  description: string;

  @OneToMany(() => Measurement, measurement => measurement.maturityModel, { cascade: true })
  measurements: Measurement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
