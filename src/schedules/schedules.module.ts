import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { ScheduleEntity, DeviceEntity } from '../common/entities';
import { OwnershipService } from '../common/services';
import { ScheduleValidatorService } from './services/schedule-validator.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleEntity, DeviceEntity])],
  controllers: [SchedulesController],
  providers: [SchedulesService, OwnershipService, ScheduleValidatorService],
  exports: [SchedulesService],
})
export class SchedulesModule {}