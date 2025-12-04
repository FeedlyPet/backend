import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DeviceEntity, PetEntity, FeedingEventEntity } from '../common/entities';
import { OwnershipService } from '../common/services';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceEntity, PetEntity, FeedingEventEntity])],
  controllers: [DevicesController],
  providers: [DevicesService, OwnershipService],
  exports: [DevicesService],
})
export class DevicesModule {}