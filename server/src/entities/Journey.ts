import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Activity } from './Activity';

@Entity('journeys')
export class Journey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  owner: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  dependencyGraph!: string | null; // JSON string representing the dependency graph

  @OneToMany(() => Activity, activity => activity.journey, { cascade: true })
  activities: Activity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

