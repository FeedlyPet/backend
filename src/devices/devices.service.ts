import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceEntity, PetEntity, FeedingEventEntity, FeedingType } from '../common/entities';
import {
  CreateDeviceDto,
  UpdateDeviceDto,
  DeviceResponseDto,
  DeviceWithPasswordResponseDto,
  QueryDevicesDto,
  ManualFeedDto,
  ManualFeedResponseDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { OwnershipService } from '../common/services';
import { PaginationHelper, MqttPasswordUtil } from '../common/utils';
import { ERROR_MESSAGES } from '../common/constants';
import { MqttService } from '../mqtt';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceEntity)
    private devicesRepository: Repository<DeviceEntity>,
    @InjectRepository(PetEntity)
    private petsRepository: Repository<PetEntity>,
    @InjectRepository(FeedingEventEntity)
    private feedingEventsRepository: Repository<FeedingEventEntity>,
    private ownershipService: OwnershipService,
    private mqttService: MqttService,
  ) {}

  async create(
    userId: string,
    createDeviceDto: CreateDeviceDto,
  ): Promise<DeviceWithPasswordResponseDto> {
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

    const { plainPassword, hashedPassword } = MqttPasswordUtil.generateAndHash();

    const device = this.devicesRepository.create({
      ...createDeviceDto,
      userId,
      isOnline: false,
      lastSeen: null,
      mqttPasswordHash: hashedPassword,
    });

    const savedDevice = await this.devicesRepository.save(device);
    return {
      ...this.mapToResponseDto(savedDevice),
      mqttPassword: plainPassword,
    };
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

  async regenerateMqttPassword(
    id: string,
    userId: string,
  ): Promise<DeviceWithPasswordResponseDto> {
    const device = await this.ownershipService.verifyDirectOwnership(
      this.devicesRepository,
      id,
      userId,
      ERROR_MESSAGES.DEVICE.NOT_FOUND,
      ERROR_MESSAGES.DEVICE.NOT_OWNED,
    );

    const { plainPassword, hashedPassword } = MqttPasswordUtil.generateAndHash();

    device.mqttPasswordHash = hashedPassword;
    const updatedDevice = await this.devicesRepository.save(device);

    return {
      ...this.mapToResponseDto(updatedDevice),
      mqttPassword: plainPassword,
    };
  }

  async manualFeed(
    id: string,
    userId: string,
    manualFeedDto: ManualFeedDto,
  ): Promise<ManualFeedResponseDto> {
    const device = await this.ownershipService.verifyDirectOwnership(
      this.devicesRepository,
      id,
      userId,
      ERROR_MESSAGES.DEVICE.NOT_FOUND,
      ERROR_MESSAGES.DEVICE.NOT_OWNED,
    );

    let commandSent = false;
    if (this.mqttService.isConnected()) {
      commandSent = await this.mqttService.sendFeedCommand(
        device.deviceId,
        manualFeedDto.portionSize,
      );
    }

    const feedingEvent = this.feedingEventsRepository.create({
      deviceId: device.id,
      petId: device.petId,
      portionSize: manualFeedDto.portionSize,
      type: FeedingType.MANUAL,
      success: true,
      timestamp: new Date(),
    });

    await this.feedingEventsRepository.save(feedingEvent);

    return {
      success: true,
      message: commandSent
        ? 'Manual feeding command sent successfully'
        : 'Feeding event recorded (MQTT not connected)',
      commandSent,
    };
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