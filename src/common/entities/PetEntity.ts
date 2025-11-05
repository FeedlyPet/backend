import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './UserEntity';
import { DeviceEntity } from './DeviceEntity';
import { FeedingEventEntity } from './FeedingEventEntity';
import { PetSpecies } from "../enums/PetSpecies";

@Entity('pets')
export class PetEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({
        type: 'enum',
        enum: PetSpecies,
    })
    species: PetSpecies;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    weight: number;

    @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => UserEntity, (user) => user.pets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @OneToMany(() => DeviceEntity, (device) => device.pet)
    devices: DeviceEntity[];

    @OneToMany(() => FeedingEventEntity, (event) => event.pet)
    feedingEvents: FeedingEventEntity[];
}