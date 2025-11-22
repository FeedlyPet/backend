import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceEntity, PetEntity } from '../common/entities';
import {
  CreateDeviceDto,
  UpdateDeviceDto,
  DeviceResponseDto,
  QueryDevicesDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { OwnershipService } from '../common/services';
import { PaginationHelper } from '../common/utils';
import { ERROR_MESSAGES } from '../common/constants';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceEntity)
    private devicesRepository: Repository<DeviceEntity>,
    @InjectRepository(PetEntity)
    private petsRepository: Repository<PetEntity>,
    private ownershipService: OwnershipService,
  ) {}

  async create(
    userId: string,
    createDeviceDto: CreateDeviceDto,
  ): Promise<DeviceResponseDto> {
    const existingDevice = await this.devicesRepository.findOne({
      where: { deviceId: createDeviceDto.deviceId },
    });

    if (existingDevice) {
      throw new ConflictException('Device with this deviceId already exists');
    }

    if (createDeviceDto.petId) {
      await this.ownershipService.verifyPetOwnership(
        this.petsRepository,
        createDeviceDto.petId,
        userId,
      );
    }

    const device = this.devicesRepository.create({
      ...createDeviceDto,
      userId,
      isOnline: false,
      lastSeen: null,
    });

    const savedDevice = await this.devicesRepository.save(device);
    return this.mapToResponseDto(savedDevice);
  }

  async findAll(
    userId: string,
    query: QueryDevicesDto,
  ): Promise<PaginatedResponseDto<DeviceResponseDto>> {
    const { page = 1, limit = 10, search } = query;

    const queryBuilder = this.devicesRepository
      .createQueryBuilder('device')
      .where('device.userId = :userId', { userId });

    if (search) {
      queryBuilder.andWhere(
        '(device.name ILIKE :search OR device.deviceId ILIKE :search OR device.location ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    PaginationHelper.applyPagination(queryBuilder, query, 'device', 'createdAt');

    return PaginationHelper.buildPaginatedResponse(
      queryBuilder,
      page,
      limit,
      (device) => this.mapToResponseDto(device),
    );
  }

  async findOne(id: string, userId: string): Promise<DeviceResponseDto> {
    const device = await this.ownershipService.verifyDirectOwnership(
      this.devicesRepository,
      id,
      userId,
      ERROR_MESSAGES.DEVICE.NOT_FOUND,
      ERROR_MESSAGES.DEVICE.NOT_OWNED,
    );

    return this.mapToResponseDto(device);
  }

  async update(
    id: string,
    userId: string,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    const device = await this.ownershipService.verifyDirectOwnership(
      this.devicesRepository,
      id,
      userId,
      ERROR_MESSAGES.DEVICE.NOT_FOUND,
      ERROR_MESSAGES.DEVICE.NOT_OWNED,
    );

    if (updateDeviceDto.petId !== undefined) {
      if (updateDeviceDto.petId === null) {
        device.petId = null;
      } else {
        await this.ownershipService.verifyPetOwnership(
          this.petsRepository,
          updateDeviceDto.petId,
          userId,
        );
        device.petId = updateDeviceDto.petId;
      }
    }

    if (updateDeviceDto.name !== undefined) {
      device.name = updateDeviceDto.name;
    }
    if (updateDeviceDto.location !== undefined) {
      device.location = updateDeviceDto.location;
    }

    const updatedDevice = await this.devicesRepository.save(device);
    return this.mapToResponseDto(updatedDevice);
  }

  async remove(id: string, userId: string): Promise<void> {
    const device = await this.ownershipService.verifyDirectOwnership(
      this.devicesRepository,
      id,
      userId,
      ERROR_MESSAGES.DEVICE.NOT_FOUND,
      ERROR_MESSAGES.DEVICE.NOT_OWNED,
    );

    await this.devicesRepository.remove(device);
  }

  private mapToResponseDto(device: DeviceEntity): DeviceResponseDto {
    return {
      id: device.id,
      userId: device.userId,
      petId: device.petId,
      deviceId: device.deviceId,
      name: device.name,
      location: device.location,
      isOnline: device.isOnline,
      lastSeen: device.lastSeen,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    };
  }
}