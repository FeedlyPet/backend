import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceEntity, PetEntity } from '../entities';
import { ERROR_MESSAGES } from '../constants';

@Injectable()
export class DeviceValidatorService {
  constructor(
    @InjectRepository(DeviceEntity)
    private devicesRepository: Repository<DeviceEntity>,
    @InjectRepository(PetEntity)
    private petsRepository: Repository<PetEntity>,
  ) {}

  async verifyDeviceOwnership(
    deviceId: string,
    userId: string,
  ): Promise<DeviceEntity> {
    const device = await this.devicesRepository.findOne({
      where: { id: deviceId, userId },
    });

    if (!device) {
      throw new NotFoundException(ERROR_MESSAGES.DEVICE.NOT_OWNED);
    }

    return device;
  }

  async verifyPetOwnership(petId: string, userId: string): Promise<PetEntity> {
    const pet = await this.petsRepository.findOne({
      where: { id: petId, userId },
    });

    if (!pet) {
      throw new BadRequestException(ERROR_MESSAGES.PET.NOT_OWNED);
    }

    return pet;
  }

  async checkDeviceAssignment(
    deviceId: string,
    currentPetId?: string,
  ): Promise<void> {
    const existingDevice = await this.devicesRepository.findOne({
      where: { deviceId },
    });

    if (existingDevice && existingDevice.petId !== currentPetId) {
      throw new BadRequestException(ERROR_MESSAGES.DEVICE.ALREADY_ASSIGNED);
    }
  }
}