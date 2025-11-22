import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ERROR_MESSAGES } from '../constants';

@Injectable()
export class OwnershipService {

  async verifyDeviceResourceOwnership<T extends { device?: { userId: string } }>(
    repository: Repository<T>,
    resourceId: string,
    userId: string,
    resourceName: string,
    notFoundMessage: string,
    forbiddenMessage: string,
  ): Promise<T> {
    const resource = await repository.findOne({
      where: { id: resourceId } as any,
      relations: ['device'],
    });

    if (!resource) {
      throw new NotFoundException(notFoundMessage);
    }

    if (resource.device?.userId !== userId) {
      throw new ForbiddenException(forbiddenMessage);
    }

    return resource;
  }

  async verifyDirectOwnership<T extends { userId: string }>(
    repository: Repository<T>,
    resourceId: string,
    userId: string,
    notFoundMessage: string,
    forbiddenMessage: string,
  ): Promise<T> {
    const resource = await repository.findOne({
      where: { id: resourceId } as any,
    });

    if (!resource) {
      throw new NotFoundException(notFoundMessage);
    }

    if (resource.userId !== userId) {
      throw new ForbiddenException(forbiddenMessage);
    }

    return resource;
  }

  async verifyDeviceOwnership<T extends { userId: string }>(
    devicesRepository: Repository<T>,
    deviceId: string,
    userId: string,
  ): Promise<T> {
    const device = await devicesRepository.findOne({
      where: { id: deviceId, userId } as any,
    });

    if (!device) {
      throw new NotFoundException(ERROR_MESSAGES.DEVICE.NOT_OWNED);
    }

    return device;
  }

  async verifyPetOwnership<T extends { userId: string }>(
    petsRepository: Repository<T>,
    petId: string,
    userId: string,
  ): Promise<T> {
    const pet = await petsRepository.findOne({
      where: { id: petId, userId } as any,
    });

    if (!pet) {
      throw new NotFoundException(ERROR_MESSAGES.PET.NOT_OWNED);
    }

    return pet;
  }
}