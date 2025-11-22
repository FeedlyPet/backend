import {
    Entity,
    PrimaryColumn,
    Column,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('notification_settings')
export class NotificationSettingsEntity {
    @PrimaryColumn({ type: 'uuid', name: 'user_id' })
    userId: string;

    @Column({ type: 'boolean', default: true, name: 'feeding_success' })
    feedingSuccess: boolean;

    @Column({ type: 'boolean', default: true, name: 'feeding_failed' })
    feedingFailed: boolean;

    @Column({ type: 'boolean', default: true, name: 'low_food_level' })
    lowFoodLevel: boolean;

    @Column({ type: 'boolean', default: true, name: 'device_status' })
    deviceStatus: boolean;

    @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(() => UserEntity, (user) => user.notificationSettings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}