import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, ScheduleResponseDto, UpdateScheduleDto, QuerySchedulesDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@ApiTags('Schedules')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post('devices/:deviceId/schedules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new feeding schedule for a device' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data, max schedules exceeded, or time interval too short',
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
  })
  async create(
    @CurrentUser() user: any,
    @Param('deviceId') deviceId: string,
    @Body(ValidationPipe) createScheduleDto: CreateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.create(user.id, deviceId, createScheduleDto);
  }

  @Get('devices/:deviceId/schedules')
  @ApiOperation({ summary: 'Get all schedules for a device with pagination and filtering' })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
  })
  async findAll(
    @CurrentUser() user: any,
    @Param('deviceId') deviceId: string,
    @Query(ValidationPipe) query: QuerySchedulesDto,
  ): Promise<PaginatedResponseDto<ScheduleResponseDto>> {
    return this.schedulesService.findAll(user.id, deviceId, query);
  }

  @Get('schedules/:id')
  @ApiOperation({ summary: 'Get schedule by ID' })
  @ApiResponse({
    status: 404,
    description: 'Schedule not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Schedule does not belong to you',
  })
  async findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.findOne(user.id, id);
  }

  @Patch('schedules/:id')
  @ApiOperation({ summary: 'Update schedule' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or time interval too short',
  })
  @ApiResponse({
    status: 404,
    description: 'Schedule not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Schedule does not belong to you',
  })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body(ValidationPipe) updateScheduleDto: UpdateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.update(user.id, id, updateScheduleDto);
  }

  @Patch('schedules/:id/toggle')
  @ApiOperation({ summary: 'Toggle schedule active status' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Max active schedules exceeded',
  })
  @ApiResponse({
    status: 404,
    description: 'Schedule not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Schedule does not belong to you',
  })
  async toggle(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.toggle(user.id, id);
  }

  @Delete('schedules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete schedule' })
  @ApiResponse({
    status: 404,
    description: 'Schedule not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Schedule does not belong to you',
  })
  async remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<void> {
    return this.schedulesService.remove(user.id, id);
  }
}