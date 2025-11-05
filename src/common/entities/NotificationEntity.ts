import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { UserEntity } from './UserEntity';
import { DeviceEntity } from './DeviceEntity';
import { NotificationType } from "../enums/NotificationType";

@Entity('notifications')
export class NotificationEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @Column({ type: 'uuid', name: 'device_id', nullable: true })
    deviceId: string | null;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({ type: 'varchar', length: 200 })
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'boolean', default: false, name: 'is_read' })
    isRead: boolean;

    @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => UserEntity, (user) => user.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @ManyToOne(() => DeviceEntity, (device) => device.notifications, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'device_id' })
    device: DeviceEntity | null;
}