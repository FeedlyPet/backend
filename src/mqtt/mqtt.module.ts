import { Module, Global, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttService } from './mqtt.service';
import {
  DeviceEntity,
  FeedingEventEntity,
  FoodLevelEntity,
  ScheduleEntity,
} from '../common/entities';
import { EventsModule } from '../events/events.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeviceEntity,
      FeedingEventEntity,
      FoodLevelEntity,
      ScheduleEntity,
    ]),
    forwardRef(() => EventsModule),
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
