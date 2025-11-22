import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FeedingEventsService } from './feeding-events.service';
import { CreateFeedingEventDto, FeedingEventResponseDto, QueryFeedingEventsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@ApiTags('Feeding Events')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FeedingEventsController {
  constructor(private readonly feedingEventsService: FeedingEventsService) {}

  @Post('feeding-events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new feeding event (internal use or MQTT)' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data',
  })
  async create(
    @Body(ValidationPipe) createFeedingEventDto: CreateFeedingEventDto,
  ): Promise<FeedingEventResponseDto> {
    return this.feedingEventsService.create(createFeedingEventDto);
  }

  @Get('devices/:deviceId/events')
  @ApiOperation({ summary: 'Get feeding history for a device with filtering' })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
  })
  async findAllByDevice(
    @CurrentUser() user: any,
    @Param('deviceId') deviceId: string,
    @Query(ValidationPipe) query: QueryFeedingEventsDto,
  ): Promise<PaginatedResponseDto<FeedingEventResponseDto>> {
    return this.feedingEventsService.findAllByDevice(user.id, deviceId, query);
  }

  @Get('feeding-events/:id')
  @ApiOperation({ summary: 'Get feeding event by ID' })
  @ApiResponse({
    status: 404,
    description: 'Feeding event not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Event does not belong to you',
  })
  async findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<FeedingEventResponseDto> {
    return this.feedingEventsService.findOne(user.id, id);
  }
}