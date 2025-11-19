import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity('email_verifications')
export class EmailVerificationEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @Column({ type: 'varchar', length: 255, name: 'token_hash' })
    tokenHash: string;

    @Column({ type: 'timestamp with time zone', name: 'expires_at' })
    expiresAt: Date;

    @Column({ type: 'boolean', default: false, name: 'is_used' })
    isUsed: boolean;

    @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => UserEntity, (user) => user.emailVerifications)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}