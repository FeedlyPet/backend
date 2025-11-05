import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from "./common/typeorm.config";
import { DeviceEntity } from './common/entities/DeviceEntity';
import { FeedingEventEntity } from './common/entities/FeedingEventEntity';
import { FoodLevelEntity } from './common/entities/FoodLevelEntity';
import { NotificationEntity } from './common/entities/NotificationEntity';
import { NotificationSettingsEntity } from './common/entities/NotificationSettingsEntity';
import { PetEntity } from './common/entities/PetEntity';
import { ScheduleEntity } from './common/entities/ScheduleEntity';
import { UserEntity } from './common/entities/UserEntity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...typeOrmConfig,
      entities: [
          DeviceEntity,
          FeedingEventEntity,
          FoodLevelEntity,
          NotificationEntity,
          NotificationSettingsEntity,
          PetEntity,
          ScheduleEntity,
          UserEntity,
      ]
    }),
  ],
})
export class AppModule {}