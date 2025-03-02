// server/src/entities/Activity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Service } from './Service';
import { Journey } from './Journey';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  owner!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  dependencyGraph!: string | null;

  @ManyToOne(() => Journey, journey => journey.activities, { nullable: true })
  journey!: Journey | null;

  @OneToMany(() => Service, service => service.activity, { cascade: true })
  services!: Service[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}