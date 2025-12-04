import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationEntity,
  NotificationSettingsEntity,
  NotificationType,
} from '../common/entities';
import {
  NotificationResponseDto,
  NotificationSettingsResponseDto,
  QueryNotificationsDto,
  UpdateNotificationSettingsDto,
  CreateNotificationDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationHelper } from '../common/utils';
import { ERROR_MESSAGES } from '../common/constants';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationsRepository: Repository<NotificationEntity>,
    @InjectRepository(NotificationSettingsEntity)
    private notificationSettingsRepository: Repository<NotificationSettingsEntity>,
  ) {}

  async findAll(
    userId: string,
    query: QueryNotificationsDto,
  ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    const { page = 1, limit = 10, type, isRead, deviceId } = query;

    const queryBuilder = this.notificationsRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    if (deviceId) {
      queryBuilder.andWhere('notification.deviceId = :deviceId', { deviceId });
    }

    PaginationHelper.applyPagination(queryBuilder, query, 'notification', 'createdAt');

    return PaginationHelper.buildPaginatedResponse(
      queryBuilder,
      page,
      limit,
      (notification) => this.mapToResponseDto(notification),
    );
  }

  async findOne(id: string, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.NOTIFICATION.NOT_OWNED);
    }

    return this.mapToResponseDto(notification);
  }

  async markAsRead(id: string, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.NOTIFICATION.NOT_OWNED);
    }

    notification.isRead = true;
    const updatedNotification = await this.notificationsRepository.save(notification);

    return this.mapToResponseDto(updatedNotification);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );

    return { count: result.affected || 0 };
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.NOTIFICATION.NOT_OWNED);
    }

    await this.notificationsRepository.remove(notification);
  }

  async getSettings(userId: string): Promise<NotificationSettingsResponseDto> {
    let settings = await this.notificationSettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = this.notificationSettingsRepository.create({
        userId,
        feedingSuccess: true,
        feedingFailed: true,
        lowFoodLevel: true,
        deviceStatus: true,
      });
      settings = await this.notificationSettingsRepository.save(settings);
    }

    return this.mapSettingsToResponseDto(settings);
  }

  async updateSettings(
    userId: string,
    updateDto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettingsResponseDto> {
    let settings = await this.notificationSettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = this.notificationSettingsRepository.create({
        userId,
        feedingSuccess: true,
        feedingFailed: true,
        lowFoodLevel: true,
        deviceStatus: true,
      });
    }

    if (updateDto.feedingSuccess !== undefined) {
      settings.feedingSuccess = updateDto.feedingSuccess;
    }
    if (updateDto.feedingFailed !== undefined) {
      settings.feedingFailed = updateDto.feedingFailed;
    }
    if (updateDto.lowFoodLevel !== undefined) {
      settings.lowFoodLevel = updateDto.lowFoodLevel;
    }
    if (updateDto.deviceStatus !== undefined) {
      settings.deviceStatus = updateDto.deviceStatus;
    }

    const updatedSettings = await this.notificationSettingsRepository.save(settings);
    return this.mapSettingsToResponseDto(updatedSettings);
  }

  async create(createDto: CreateNotificationDto): Promise<NotificationResponseDto | null> {
    const settings = await this.notificationSettingsRepository.findOne({
      where: { userId: createDto.userId },
    });

    if (settings && !this.shouldSendNotification(createDto.type, settings)) {
      return null;
    }

    const notification = this.notificationsRepository.create({
      userId: createDto.userId,
      deviceId: createDto.deviceId || null,
      type: createDto.type,
      title: createDto.title,
      message: createDto.message,
      isRead: false,
    });

    const savedNotification = await this.notificationsRepository.save(notification);
    return this.mapToResponseDto(savedNotification);
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationsRepository.count({
      where: { userId, isRead: false },
    });

    return { count };
  }

  private shouldSendNotification(
    type: NotificationType,
    settings: NotificationSettingsEntity,
  ): boolean {
    switch (type) {
      case NotificationType.FEEDING_SUCCESS:
        return settings.feedingSuccess;
      case NotificationType.FEEDING_FAILED:
        return settings.feedingFailed;
      case NotificationType.LOW_FOOD_LEVEL:
        return settings.lowFoodLevel;
      case NotificationType.DEVICE_OFFLINE:
      case NotificationType.DEVICE_ONLINE:
        return settings.deviceStatus;
      default:
        return true;
    }
  }

  private mapToResponseDto(notification: NotificationEntity): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      deviceId: notification.deviceId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }

  private mapSettingsToResponseDto(
    settings: NotificationSettingsEntity,
  ): NotificationSettingsResponseDto {
    return {
      userId: settings.userId,
      feedingSuccess: settings.feedingSuccess,
      feedingFailed: settings.feedingFailed,
      lowFoodLevel: settings.lowFoodLevel,
      deviceStatus: settings.deviceStatus,
      updatedAt: settings.updatedAt,
    };
  }
}