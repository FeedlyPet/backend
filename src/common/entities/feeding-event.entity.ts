import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { DeviceEntity } from './device.entity';
import { PetEntity } from './pet.entity';
import { ScheduleEntity } from './schedule.entity';
import { FeedingType } from "../enums/feeding-type";

@Entity('feeding_events')
export class FeedingEventEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'uuid', name: 'device_id'})
    deviceId: string;

    @Column({type: 'uuid', name: 'pet_id', nullable: true})
    petId: string | null;

    @Column({type: 'uuid', name: 'schedule_id', nullable: true})
    scheduleId: string | null;

    @Column({type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP'})
    timestamp: Date;

    @Column({type: 'int', name: 'portion_size'})
    portionSize: number;

    @Column({
        type: 'enum',
        enum: FeedingType,
    })
    type: FeedingType;

    @Column({type: 'boolean', default: true})
    success: boolean;

    @Column({type: 'text', nullable: true, name: 'error_message'})
    errorMessage: string | null;

    @Column({type: 'varchar', length: 500, nullable: true, name: 'photo_url'})
    photoUrl: string | null;

    @CreateDateColumn({type: 'timestamp with time zone', name: 'created_at'})
    createdAt: Date;

    @ManyToOne(() => DeviceEntity, (device) => device.feedingEvents, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'device_id'})
    device: DeviceEntity;

    @ManyToOne(() => PetEntity, (pet) => pet.feedingEvents, {onDelete: 'SET NULL', nullable: true})
    @JoinColumn({name: 'pet_id'})
    pet: PetEntity | null;

    @ManyToOne(() => ScheduleEntity, (schedule) => schedule.feedingEvents, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({name: 'schedule_id'})
    schedule: ScheduleEntity | null;
}