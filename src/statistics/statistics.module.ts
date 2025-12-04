import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { FeedingEventEntity, DeviceEntity } from '../common/entities';
import { OwnershipService } from '../common/services';

@Module({
  imports: [TypeOrmModule.forFeature([FeedingEventEntity, DeviceEntity])],
  controllers: [StatisticsController],
  providers: [StatisticsService, OwnershipService],
  exports: [StatisticsService],
})
export class StatisticsModule {}