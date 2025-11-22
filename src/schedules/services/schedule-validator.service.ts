import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEntity } from '../../common/entities';
import { APP_CONFIG, ERROR_MESSAGES } from '../../common/constants';
import { timeToMinutes } from '../../common/utils';

@Injectable()
export class ScheduleValidatorService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private schedulesRepository: Repository<ScheduleEntity>,
  ) {}

  async validateMaxActiveSchedules(
    deviceId: string,
    excludeScheduleId?: string,
  ): Promise<void> {
    const queryBuilder = this.schedulesRepository
      .createQueryBuilder('schedule')
      .where('schedule.deviceId = :deviceId', { deviceId })
      .andWhere('schedule.isActive = :isActive', { isActive: true });

    if (excludeScheduleId) {
      queryBuilder.andWhere('schedule.id != :excludeScheduleId', {
        excludeScheduleId,
      });
    }

    const activeCount = await queryBuilder.getCount();

    if (activeCount >= APP_CONFIG.SCHEDULE.MAX_ACTIVE_SCHEDULES) {
      throw new BadRequestException(ERROR_MESSAGES.SCHEDULE.MAX_ACTIVE_REACHED);
    }
  }

  async validateTimeIntervals(
    deviceId: string,
    feedingTime: string,
    daysOfWeek: string[],
    excludeScheduleId?: string,
  ): Promise<void> {
    const queryBuilder = this.schedulesRepository
      .createQueryBuilder('schedule')
      .where('schedule.deviceId = :deviceId', { deviceId })
      .andWhere('schedule.isActive = :isActive', { isActive: true });

    if (excludeScheduleId) {
      queryBuilder.andWhere('schedule.id != :excludeScheduleId', {
        excludeScheduleId,
      });
    }

    const existingSchedules = await queryBuilder.getMany();

    const newTimeInMinutes = timeToMinutes(feedingTime);

    for (const existingSchedule of existingSchedules) {
      const hasOverlapDays = existingSchedule.daysOfWeek.some((day) =>
        daysOfWeek.includes(day),
      );

      if (hasOverlapDays) {
        const existingTimeInMinutes = timeToMinutes(
          existingSchedule.feedingTime,
        );

        const timeDifferenceMinutes = Math.abs(
          newTimeInMinutes - existingTimeInMinutes,
        );

        if (
          timeDifferenceMinutes <
          APP_CONFIG.SCHEDULE.MIN_INTERVAL_HOURS * 60
        ) {
          throw new BadRequestException(
            ERROR_MESSAGES.SCHEDULE.MIN_INTERVAL_NOT_MET,
          );
        }
      }
    }
  }

  async validateScheduleCreation(
    deviceId: string,
    feedingTime: string,
    daysOfWeek: string[],
    isActive: boolean,
  ): Promise<void> {
    if (isActive) {
      await this.validateMaxActiveSchedules(deviceId);
    }
    await this.validateTimeIntervals(deviceId, feedingTime, daysOfWeek);
  }

  async validateScheduleUpdate(
    scheduleId: string,
    deviceId: string,
    feedingTime?: string,
    daysOfWeek?: string[],
    isActive?: boolean,
  ): Promise<void> {
    if (isActive !== undefined && isActive) {
      await this.validateMaxActiveSchedules(deviceId, scheduleId);
    }

    if (feedingTime && daysOfWeek) {
      await this.validateTimeIntervals(
        deviceId,
        feedingTime,
        daysOfWeek,
        scheduleId,
      );
    }
  }
}