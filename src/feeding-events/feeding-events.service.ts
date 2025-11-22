import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedingEventEntity, DeviceEntity } from '../common/entities';
import {
  CreateFeedingEventDto,
  FeedingEventResponseDto,
  QueryFeedingEventsDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { OwnershipService } from '../common/services';
import { PaginationHelper } from '../common/utils';
import { ERROR_MESSAGES } from '../common/constants';

@Injectable()
export class FeedingEventsService {
  constructor(
    @InjectRepository(FeedingEventEntity)
    private feedingEventsRepository: Repository<FeedingEventEntity>,
    @InjectRepository(DeviceEntity)
    private devicesRepository: Repository<DeviceEntity>,
    private ownershipService: OwnershipService,
  ) {}

  async create(
    createFeedingEventDto: CreateFeedingEventDto,
  ): Promise<FeedingEventResponseDto> {
    const feedingEvent = this.feedingEventsRepository.create({
      ...createFeedingEventDto,
      timestamp: new Date(),
      success: createFeedingEventDto.success ?? true,
    });

    const savedEvent = await this.feedingEventsRepository.save(feedingEvent);
    return this.mapToResponseDto(savedEvent);
  }

  async findAllByDevice(
    userId: string,
    deviceId: string,
    query: QueryFeedingEventsDto,
  ): Promise<PaginatedResponseDto<FeedingEventResponseDto>> {
    await this.ownershipService.verifyDeviceOwnership(
      this.devicesRepository,
      deviceId,
      userId,
    );

    const { page = 1, limit = 10, type, success, startDate, endDate } = query;

    const queryBuilder = this.feedingEventsRepository
      .createQueryBuilder('event')
      .where('event.deviceId = :deviceId', { deviceId });

    if (type !== undefined) {
      queryBuilder.andWhere('event.type = :type', { type });
    }

    if (success !== undefined) {
      queryBuilder.andWhere('event.success = :success', { success });
    }

    PaginationHelper.applyDateRangeFilter(
      queryBuilder,
      'event',
      'timestamp',
      startDate,
      endDate,
    );

    PaginationHelper.applyPagination(queryBuilder, query, 'event', 'timestamp');

    return PaginationHelper.buildPaginatedResponse(
      queryBuilder,
      page,
      limit,
      (event) => this.mapToResponseDto(event),
    );
  }

  async findOne(
    userId: string,
    eventId: string,
  ): Promise<FeedingEventResponseDto> {
    const event = await this.ownershipService.verifyDeviceResourceOwnership(
      this.feedingEventsRepository,
      eventId,
      userId,
      'event',
      ERROR_MESSAGES.FEEDING_EVENT.NOT_FOUND,
      ERROR_MESSAGES.FEEDING_EVENT.NOT_OWNED,
    );

    return this.mapToResponseDto(event);
  }

  private mapToResponseDto(
    event: FeedingEventEntity,
  ): FeedingEventResponseDto {
    return {
      id: event.id,
      deviceId: event.deviceId,
      petId: event.petId,
      scheduleId: event.scheduleId,
      timestamp: event.timestamp,
      portionSize: event.portionSize,
      type: event.type,
      success: event.success,
      errorMessage: event.errorMessage,
      photoUrl: event.photoUrl,
      createdAt: event.createdAt,
    };
  }
}