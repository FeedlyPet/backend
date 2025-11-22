import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedingEventsController } from './feeding-events.controller';
import { FeedingEventsService } from './feeding-events.service';
import { FeedingEventEntity, DeviceEntity } from '../common/entities';
import { OwnershipService } from '../common/services';

@Module({
  imports: [TypeOrmModule.forFeature([FeedingEventEntity, DeviceEntity])],
  controllers: [FeedingEventsController],
  providers: [FeedingEventsService, OwnershipService],
  exports: [FeedingEventsService],
})
export class FeedingEventsModule {}