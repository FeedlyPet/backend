import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PetEntity } from './pet.entity';
import { ScheduleEntity } from './schedule.entity';
import { FeedingEventEntity } from './feeding-event.entity';
import { FoodLevelEntity } from './food-level.entity';
import { NotificationEntity } from './notification.entity';

@Entity('devices')
export class DeviceEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @Column({ type: 'uuid', name: 'pet_id', nullable: true })
    petId: string | null;

    @Column({ type: 'varchar', length: 100, unique: true, name: 'device_id' })
    deviceId: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    location: string | null;

    @Column({ type: 'boolean', default: false, name: 'is_online' })
    isOnline: boolean;

    @Column({ type: 'timestamp with time zone', nullable: true, name: 'last_seen' })
    lastSeen: Date | null;

    @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => UserEntity, (user) => user.devices, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @ManyToOne(() => PetEntity, (pet) => pet.devices, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'pet_id' })
    pet: PetEntity | null;

    @OneToMany(() => ScheduleEntity, (schedule) => schedule.device)
    schedules: ScheduleEntity[];

    @OneToMany(() => FeedingEventEntity, (event) => event.device)
    feedingEvents: FeedingEventEntity[];

    @OneToMany(() => FoodLevelEntity, (foodLevel) => foodLevel.device)
    foodLevels: FoodLevelEntity[];

    @OneToMany(() => NotificationEntity, (notification) => notification.device)
    notifications: NotificationEntity[];
}