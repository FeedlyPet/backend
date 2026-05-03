import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { EmailType } from '../types/email.type';

@Entity('email_logs')
export class EmailLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 255 })
  recipient: string;

  @Column({
    type: 'enum',
    enum: EmailType,
    name: 'email_type',
  })
  emailType: EmailType;

  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ type: 'boolean', default: true, name: 'sent_successfully' })
  sentSuccessfully: boolean;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'sent_at' })
  sentAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;
}
