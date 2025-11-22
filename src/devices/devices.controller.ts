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
import { DevicesService } from './devices.service';
import { CreateDeviceDto, DeviceResponseDto, UpdateDeviceDto, QueryDevicesDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@ApiTags('Devices')
@Controller('devices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new device' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or pet not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'Device with this deviceId already exists',
  })
  async create(
    @CurrentUser() user: any,
    @Body(ValidationPipe) createDeviceDto: CreateDeviceDto,
  ): Promise<DeviceResponseDto> {
    return this.devicesService.create(user.id, createDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user devices with pagination, sorting and search' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(
    @CurrentUser() user: any,
    @Query(ValidationPipe) query: QueryDevicesDto,
  ): Promise<PaginatedResponseDto<DeviceResponseDto>> {
    return this.devicesService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device by ID' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Device does not belong to user',
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<DeviceResponseDto> {
    return this.devicesService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update device details' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or pet not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Device does not belong to user',
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
  })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body(ValidationPipe) updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    return this.devicesService.update(id, user.id, updateDeviceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete device' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Device does not belong to user',
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.devicesService.remove(id, user.id);
  }
}
