import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MaturityModel } from './MaturityModel';

@Entity('maturity_levels')
export class MaturityLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'float' })
  minPercentage: number;

  @Column({ type: 'float' })
  maxPercentage: number;

  @ManyToOne(() => MaturityModel)
  maturityModel: MaturityModel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
