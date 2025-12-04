import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FeedingEventEntity, DeviceEntity, FeedingType } from '../common/entities';
import {
  QueryStatisticsDto,
  StatisticsPeriod,
  StatisticsResponseDto,
  DailyBreakdownDto,
} from './dto';
import { OwnershipService } from '../common/services';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(FeedingEventEntity)
    private feedingEventsRepository: Repository<FeedingEventEntity>,
    @InjectRepository(DeviceEntity)
    private devicesRepository: Repository<DeviceEntity>,
    private ownershipService: OwnershipService,
  ) {}

  async getDeviceStatistics(
    userId: string,
    deviceId: string,
    query: QueryStatisticsDto,
  ): Promise<StatisticsResponseDto> {
    await this.ownershipService.verifyDeviceOwnership(
      this.devicesRepository,
      deviceId,
      userId,
    );

    const { startDate, endDate } = this.calculateDateRange(query);
    const { previousStart, previousEnd } = this.calculatePreviousPeriod(startDate, endDate);

    const [currentEvents, previousEvents] = await Promise.all([
      this.getEventsInRange(deviceId, startDate, endDate),
      this.getEventsInRange(deviceId, previousStart, previousEnd),
    ]);

    const currentStats = this.calculateStats(currentEvents);
    const previousStats = this.calculateStats(previousEvents);
    const dailyBreakdown = this.calculateDailyBreakdown(currentEvents, startDate, endDate);

    return {
      totalFeedings: currentStats.totalFeedings,
      totalFood: currentStats.totalFood,
      averagePortion: currentStats.averagePortion,
      successfulFeedings: currentStats.successfulFeedings,
      failedFeedings: currentStats.failedFeedings,
      automaticFeedings: currentStats.automaticFeedings,
      manualFeedings: currentStats.manualFeedings,
      period: {
        start: this.formatDate(startDate),
        end: this.formatDate(endDate),
      },
      dailyBreakdown,
      comparison: {
        previousFeedings: previousStats.totalFeedings,
        previousFood: previousStats.totalFood,
        feedingsChange: this.calculatePercentageChange(
          previousStats.totalFeedings,
          currentStats.totalFeedings,
        ),
        foodChange: this.calculatePercentageChange(
          previousStats.totalFood,
          currentStats.totalFood,
        ),
      },
    };
  }

  private calculateDateRange(query: QueryStatisticsDto): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.setHours(23, 59, 59, 999));

    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const period = query.period || StatisticsPeriod.WEEK;
      startDate = new Date();

      switch (period) {
        case StatisticsPeriod.WEEK:
          startDate.setDate(startDate.getDate() - 7);
          break;
        case StatisticsPeriod.MONTH:
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case StatisticsPeriod.YEAR:
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
  }

  private calculatePreviousPeriod(
    startDate: Date,
    endDate: Date,
  ): { previousStart: Date; previousEnd: Date } {
    const duration = endDate.getTime() - startDate.getTime();
    const previousEnd = new Date(startDate.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);

    return { previousStart, previousEnd };
  }

  private async getEventsInRange(
    deviceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FeedingEventEntity[]> {
    return this.feedingEventsRepository.find({
      where: {
        deviceId,
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'ASC' },
    });
  }

  private calculateStats(events: FeedingEventEntity[]): {
    totalFeedings: number;
    totalFood: number;
    averagePortion: number;
    successfulFeedings: number;
    failedFeedings: number;
    automaticFeedings: number;
    manualFeedings: number;
  } {
    const totalFeedings = events.length;
    const totalFood = events.reduce((sum, e) => sum + (e.success ? e.portionSize : 0), 0);
    const successfulFeedings = events.filter((e) => e.success).length;
    const failedFeedings = events.filter((e) => !e.success).length;
    const automaticFeedings = events.filter((e) => e.type === FeedingType.AUTOMATIC).length;
    const manualFeedings = events.filter((e) => e.type === FeedingType.MANUAL).length;

    return {
      totalFeedings,
      totalFood,
      averagePortion: successfulFeedings > 0 ? Math.round(totalFood / successfulFeedings) : 0,
      successfulFeedings,
      failedFeedings,
      automaticFeedings,
      manualFeedings,
    };
  }

  private calculateDailyBreakdown(
    events: FeedingEventEntity[],
    startDate: Date,
    endDate: Date,
  ): DailyBreakdownDto[] {
    const breakdown: Map<string, { feedings: number; food: number }> = new Map();

    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = this.formatDate(current);
      breakdown.set(dateKey, { feedings: 0, food: 0 });
      current.setDate(current.getDate() + 1);
    }

    for (const event of events) {
      const dateKey = this.formatDate(event.timestamp);
      const existing = breakdown.get(dateKey);
      if (existing) {
        existing.feedings++;
        if (event.success) {
          existing.food += event.portionSize;
        }
      }
    }

    return Array.from(breakdown.entries()).map(([date, data]) => ({
      date,
      feedings: data.feedings,
      food: data.food,
    }));
  }

  private calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}