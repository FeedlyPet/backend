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
import { FoodLevelsService } from './food-levels.service';
import { CreateFoodLevelDto, FoodLevelResponseDto, QueryFoodLevelsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@ApiTags('Food Levels')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FoodLevelsController {
  constructor(private readonly foodLevelsService: FoodLevelsService) {}

  @Post('food-levels')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record new food level reading (MQTT or internal use)' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data',
  })
  async create(
    @Body(ValidationPipe) createFoodLevelDto: CreateFoodLevelDto,
  ): Promise<FoodLevelResponseDto> {
    return this.foodLevelsService.create(createFoodLevelDto);
  }

  @Get('devices/:deviceId/food-level')
  @ApiOperation({ summary: 'Get latest food level for a device' })
  @ApiResponse({
    status: 404,
    description: 'Device not found or no food level data available',
  })
  async getLatest(
    @CurrentUser() user: any,
    @Param('deviceId') deviceId: string,
  ): Promise<FoodLevelResponseDto> {
    return this.foodLevelsService.getLatestByDevice(user.id, deviceId);
  }

  @Get('devices/:deviceId/food-levels')
  @ApiOperation({ summary: 'Get food level history for a device' })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
  })
  async findAll(
    @CurrentUser() user: any,
    @Param('deviceId') deviceId: string,
    @Query(ValidationPipe) query: QueryFoodLevelsDto,
  ): Promise<PaginatedResponseDto<FoodLevelResponseDto>> {
    return this.foodLevelsService.findAllByDevice(user.id, deviceId, query);
  }
}