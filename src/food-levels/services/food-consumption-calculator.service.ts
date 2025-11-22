import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { FeedingEventEntity } from '../../common/entities';
import { APP_CONFIG } from '../../common/constants';
import { getDaysAgo, daysBetween } from '../../common/utils';

@Injectable()
export class FoodConsumptionCalculatorService {
  constructor(
    @InjectRepository(FeedingEventEntity)
    private feedingEventsRepository: Repository<FeedingEventEntity>,
  ) {}

  async calculateEstimatedDaysLeft(
    deviceId: string,
    currentLevel: number,
  ): Promise<number | null> {
    const daysAgo = getDaysAgo(APP_CONFIG.FOOD_LEVEL.DAYS_FOR_CONSUMPTION_CALC);

    const recentFeedings = await this.feedingEventsRepository.find({
      where: {
        deviceId,
        timestamp: MoreThanOrEqual(daysAgo),
        success: true,
      },
      order: { timestamp: 'ASC' },
    });

    if (recentFeedings.length === 0) {
      return null;
    }

    const totalFoodConsumed = recentFeedings.reduce(
      (sum, feeding) => sum + feeding.portionSize,
      0,
    );

    const firstFeeding = recentFeedings[0];
    const lastFeeding = recentFeedings[recentFeedings.length - 1];
    const periodDays = Math.max(
      1,
      daysBetween(firstFeeding.timestamp, lastFeeding.timestamp),
    );

    const avgDailyConsumption = totalFoodConsumed / periodDays;

    if (avgDailyConsumption === 0) {
      return null;
    }

    const currentFoodGrams =
      (currentLevel / 100) * APP_CONFIG.FOOD_LEVEL.CONTAINER_CAPACITY_GRAMS;

    const estimatedDays = Math.floor(currentFoodGrams / avgDailyConsumption);

    return Math.max(0, estimatedDays);
  }

  isLowLevel(level: number): boolean {
    return level < APP_CONFIG.FOOD_LEVEL.LOW_LEVEL_THRESHOLD;
  }
}