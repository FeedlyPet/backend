import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { DeviceEntity } from "./device.entity";

@Entity('food_levels')
export class FoodLevelEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'device_id' })
    deviceId: string;

    @Column({ type: 'int' })
    level: number;

    @Column({ type: 'int', nullable: true, name: 'estimated_days_left' })
    estimatedDaysLeft: number | null;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;

    @ManyToOne(() => DeviceEntity, (device) => device.foodLevels, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'device_id' })
    device: DeviceEntity;
}