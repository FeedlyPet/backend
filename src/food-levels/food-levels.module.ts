import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodLevelsController } from './food-levels.controller';
import { FoodLevelsService } from './food-levels.service';
import {
  FoodLevelEntity,
  DeviceEntity,
  FeedingEventEntity,
} from '../common/entities';
import { OwnershipService } from '../common/services';
import { FoodConsumptionCalculatorService } from './services/food-consumption-calculator.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FoodLevelEntity,
      DeviceEntity,
      FeedingEventEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [FoodLevelsController],
  providers: [
    FoodLevelsService,
    OwnershipService,
    FoodConsumptionCalculatorService,
  ],
  exports: [FoodLevelsService],
})
export class FoodLevelsModule {}
