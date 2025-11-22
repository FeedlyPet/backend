import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodLevelEntity, DeviceEntity } from '../common/entities';
import {
  CreateFoodLevelDto,
  FoodLevelResponseDto,
  QueryFoodLevelsDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { OwnershipService } from '../common/services';
import { PaginationHelper } from '../common/utils';
import { ERROR_MESSAGES } from '../common/constants';
import { FoodConsumptionCalculatorService } from './services/food-consumption-calculator.service';

@Injectable()
export class FoodLevelsService {
  constructor(
    @InjectRepository(FoodLevelEntity)
    private foodLevelsRepository: Repository<FoodLevelEntity>,
    @InjectRepository(DeviceEntity)
    private devicesRepository: Repository<DeviceEntity>,
    private ownershipService: OwnershipService,
    private foodConsumptionCalculator: FoodConsumptionCalculatorService,
  ) {}

  async create(
    createFoodLevelDto: CreateFoodLevelDto,
  ): Promise<FoodLevelResponseDto> {
    let estimatedDaysLeft: number | null | undefined =
      createFoodLevelDto.estimatedDaysLeft;

    if (estimatedDaysLeft === undefined) {
      estimatedDaysLeft =
        await this.foodConsumptionCalculator.calculateEstimatedDaysLeft(
          createFoodLevelDto.deviceId,
          createFoodLevelDto.level,
        );
    }

    const foodLevel = this.foodLevelsRepository.create({
      ...createFoodLevelDto,
      estimatedDaysLeft,
      timestamp: new Date(),
    });

    const savedLevel = await this.foodLevelsRepository.save(foodLevel);

    if (this.foodConsumptionCalculator.isLowLevel(createFoodLevelDto.level)) {
      console.log(
        `Low food level alert for device ${createFoodLevelDto.deviceId}: ${createFoodLevelDto.level}%`,
      );
    }

    return this.mapToResponseDto(savedLevel);
  }

  async getLatestByDevice(
    userId: string,
    deviceId: string,
  ): Promise<FoodLevelResponseDto> {
    await this.ownershipService.verifyDeviceOwnership(
      this.devicesRepository,
      deviceId,
      userId,
    );

    const latestLevel = await this.foodLevelsRepository.findOne({
      where: { deviceId },
      order: { timestamp: 'DESC' },
    });

    if (!latestLevel) {
      throw new NotFoundException(ERROR_MESSAGES.FOOD_LEVEL.NOT_FOUND);
    }

    return this.mapToResponseDto(latestLevel);
  }

  async findAllByDevice(
    userId: string,
    deviceId: string,
    query: QueryFoodLevelsDto,
  ): Promise<PaginatedResponseDto<FoodLevelResponseDto>> {
    await this.ownershipService.verifyDeviceOwnership(
      this.devicesRepository,
      deviceId,
      userId,
    );

    const { page = 1, limit = 10, startDate, endDate } = query;

    const queryBuilder = this.foodLevelsRepository
      .createQueryBuilder('foodLevel')
      .where('foodLevel.deviceId = :deviceId', { deviceId });

    PaginationHelper.applyDateRangeFilter(
      queryBuilder,
      'foodLevel',
      'timestamp',
      startDate,
      endDate,
    );

    PaginationHelper.applyPagination(queryBuilder, query, 'foodLevel', 'timestamp');

    return PaginationHelper.buildPaginatedResponse(
      queryBuilder,
      page,
      limit,
      (level) => this.mapToResponseDto(level),
    );
  }

  private mapToResponseDto(level: FoodLevelEntity): FoodLevelResponseDto {
    return {
      id: level.id,
      deviceId: level.deviceId,
      level: level.level,
      estimatedDaysLeft: level.estimatedDaysLeft,
      timestamp: level.timestamp,
    };
  }
}