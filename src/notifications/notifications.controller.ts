import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  NotificationResponseDto,
  NotificationSettingsResponseDto,
  QueryNotificationsDto,
  UpdateNotificationSettingsDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user notifications with pagination and filtering' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(
    @CurrentUser() user: any,
    @Query(ValidationPipe) query: QueryNotificationsDto,
  ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    return this.notificationsService.findAll(user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUnreadCount(@CurrentUser() user: any): Promise<{ count: number }> {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get notification settings' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getSettings(@CurrentUser() user: any): Promise<NotificationSettingsResponseDto> {
    return this.notificationsService.getSettings(user.id);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateSettings(
    @CurrentUser() user: any,
    @Body(ValidationPipe) updateDto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettingsResponseDto> {
    return this.notificationsService.updateSettings(user.id, updateDto);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async markAllAsRead(@CurrentUser() user: any): Promise<{ count: number }> {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Notification does not belong to user',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.findOne(id, user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Notification does not belong to user',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Notification does not belong to user',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.notificationsService.remove(id, user.id);
  }
}