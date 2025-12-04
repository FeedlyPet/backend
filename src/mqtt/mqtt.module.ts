import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttService } from './mqtt.service';
import {
  DeviceEntity,
  FeedingEventEntity,
  FoodLevelEntity,
  ScheduleEntity,
} from '../common/entities';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeviceEntity,
      FeedingEventEntity,
      FoodLevelEntity,
      ScheduleEntity,
    ]),
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}