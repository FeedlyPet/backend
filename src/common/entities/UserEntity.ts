import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { PetEntity } from './PetEntity';
import { DeviceEntity } from './DeviceEntity';
import { NotificationEntity } from './NotificationEntity';
import { NotificationSettingsEntity } from './NotificationSettingsEntity';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255, name: 'password_hash' })
    passwordHash: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 50, default: 'UTC' })
    timezone: string;

    @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => PetEntity, (pet) => pet.user)
    pets: PetEntity[];

    @OneToMany(() => DeviceEntity, (device) => device.user)
    devices: DeviceEntity[];

    @OneToMany(() => NotificationEntity, (notification) => notification.user)
    notifications: Notification[];

    @OneToOne(() => NotificationSettingsEntity, (settings) => settings.user)
    notificationSettings: NotificationSettingsEntity;
}