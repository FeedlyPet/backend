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
import { DeviceEntity } from './DeviceEntity';
import { FeedingEventEntity } from './FeedingEventEntity';

@Entity('schedules')
export class ScheduleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'device_id' })
    deviceId: string;

    @Column({ type: 'time', name: 'feeding_time' })
    feedingTime: string;

    @Column({ type: 'int', name: 'portion_size' })
    portionSize: number;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive: boolean;

    @Column({ type: 'text', array: true, name: 'days_of_week' })
    daysOfWeek: string[];

    @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => DeviceEntity, (device) => device.schedules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'device_id' })
    device: DeviceEntity;

    @OneToMany(() => FeedingEventEntity, (event) => event.schedule)
    feedingEvents: FeedingEventEntity[];
}