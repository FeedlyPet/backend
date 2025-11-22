import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEntity, DeviceEntity } from '../common/entities';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  ScheduleResponseDto,
  QuerySchedulesDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { OwnershipService } from '../common/services';
import { PaginationHelper } from '../common/utils';
import { ERROR_MESSAGES } from '../common/constants';
import { ScheduleValidatorService } from './services/schedule-validator.service';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private schedulesRepository: Repository<ScheduleEntity>,
    @InjectRepository(DeviceEntity)
    private devicesRepository: Repository<DeviceEntity>,
    private ownershipService: OwnershipService,
    private scheduleValidator: ScheduleValidatorService,
  ) {}

  async create(
    userId: string,
    deviceId: string,
    createScheduleDto: CreateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    await this.ownershipService.verifyDeviceOwnership(
      this.devicesRepository,
      deviceId,
      userId,
    );

    await this.scheduleValidator.validateScheduleCreation(
      deviceId,
      createScheduleDto.feedingTime,
      createScheduleDto.daysOfWeek,
      createScheduleDto.isActive,
    );

    const schedule = this.schedulesRepository.create({
      ...createScheduleDto,
      deviceId,
    });

    const savedSchedule = await this.schedulesRepository.save(schedule);
    return this.mapToResponseDto(savedSchedule);
  }

  async findAll(
    userId: string,
    deviceId: string,
    query: QuerySchedulesDto,
  ): Promise<PaginatedResponseDto<ScheduleResponseDto>> {
    await this.ownershipService.verifyDeviceOwnership(
      this.devicesRepository,
      deviceId,
      userId,
    );

    const { page = 1, limit = 10, isActive } = query;

    const queryBuilder = this.schedulesRepository
      .createQueryBuilder('schedule')
      .where('schedule.deviceId = :deviceId', { deviceId });

    if (isActive !== undefined) {
      queryBuilder.andWhere('schedule.isActive = :isActive', { isActive });
    }

    PaginationHelper.applyPagination(queryBuilder, query, 'schedule', 'feedingTime');

    return PaginationHelper.buildPaginatedResponse(
      queryBuilder,
      page,
      limit,
      (schedule) => this.mapToResponseDto(schedule),
    );
  }

  async findOne(
    userId: string,
    scheduleId: string,
  ): Promise<ScheduleResponseDto> {
    const schedule = await this.ownershipService.verifyDeviceResourceOwnership(
      this.schedulesRepository,
      scheduleId,
      userId,
      'schedule',
      ERROR_MESSAGES.SCHEDULE.NOT_FOUND,
      ERROR_MESSAGES.SCHEDULE.NOT_OWNED,
    );

    return this.mapToResponseDto(schedule);
  }

  async update(
    userId: string,
    scheduleId: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    const schedule = await this.ownershipService.verifyDeviceResourceOwnership(
      this.schedulesRepository,
      scheduleId,
      userId,
      'schedule',
      ERROR_MESSAGES.SCHEDULE.NOT_FOUND,
      ERROR_MESSAGES.SCHEDULE.NOT_OWNED,
    );

    await this.scheduleValidator.validateScheduleUpdate(
      scheduleId,
      schedule.deviceId,
      updateScheduleDto.feedingTime,
      updateScheduleDto.daysOfWeek,
      updateScheduleDto.isActive,
    );

    Object.assign(schedule, updateScheduleDto);
    const savedSchedule = await this.schedulesRepository.save(schedule);
    return this.mapToResponseDto(savedSchedule);
  }

  async toggle(
    userId: string,
    scheduleId: string,
  ): Promise<ScheduleResponseDto> {
    const schedule = await this.ownershipService.verifyDeviceResourceOwnership(
      this.schedulesRepository,
      scheduleId,
      userId,
      'schedule',
      ERROR_MESSAGES.SCHEDULE.NOT_FOUND,
      ERROR_MESSAGES.SCHEDULE.NOT_OWNED,
    );

    const newActiveState = !schedule.isActive;

    if (newActiveState) {
      await this.scheduleValidator.validateMaxActiveSchedules(
        schedule.deviceId,
        scheduleId,
      );
    }

    schedule.isActive = newActiveState;
    const savedSchedule = await this.schedulesRepository.save(schedule);
    return this.mapToResponseDto(savedSchedule);
  }

  async remove(userId: string, scheduleId: string): Promise<void> {
    const schedule = await this.ownershipService.verifyDeviceResourceOwnership(
      this.schedulesRepository,
      scheduleId,
      userId,
      'schedule',
      ERROR_MESSAGES.SCHEDULE.NOT_FOUND,
      ERROR_MESSAGES.SCHEDULE.NOT_OWNED,
    );

    await this.schedulesRepository.remove(schedule);
  }

  private mapToResponseDto(schedule: ScheduleEntity): ScheduleResponseDto {
    return {
      id: schedule.id,
      deviceId: schedule.deviceId,
      feedingTime: schedule.feedingTime,
      portionSize: schedule.portionSize,
      isActive: schedule.isActive,
      daysOfWeek: schedule.daysOfWeek,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }
}