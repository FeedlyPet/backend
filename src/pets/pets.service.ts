import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetEntity } from '../common/entities';
import {
  CreatePetDto,
  UpdatePetDto,
  PetResponseDto,
  QueryPetsDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { OwnershipService } from '../common/services';
import { PaginationHelper } from '../common/utils';
import { ERROR_MESSAGES } from '../common/constants';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(PetEntity)
    private petsRepository: Repository<PetEntity>,
    private ownershipService: OwnershipService,
  ) {}

  async create(
    userId: string,
    createPetDto: CreatePetDto,
  ): Promise<PetResponseDto> {
    const pet = this.petsRepository.create({
      ...createPetDto,
      userId,
    });

    const savedPet = await this.petsRepository.save(pet);
    return this.mapToResponseDto(savedPet);
  }

  async findAll(
    userId: string,
    query: QueryPetsDto,
  ): Promise<PaginatedResponseDto<PetResponseDto>> {
    const { page = 1, limit = 10, search } = query;

    const queryBuilder = this.petsRepository
      .createQueryBuilder('pet')
      .where('pet.userId = :userId', { userId });

    if (search) {
      queryBuilder.andWhere('pet.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    PaginationHelper.applyPagination(queryBuilder, query, 'pet', 'createdAt');

    return PaginationHelper.buildPaginatedResponse(
      queryBuilder,
      page,
      limit,
      (pet) => this.mapToResponseDto(pet),
    );
  }

  async findOne(id: string, userId: string): Promise<PetResponseDto> {
    const pet = await this.ownershipService.verifyDirectOwnership(
      this.petsRepository,
      id,
      userId,
      ERROR_MESSAGES.PET.NOT_FOUND,
      ERROR_MESSAGES.PET.NOT_OWNED,
    );

    return this.mapToResponseDto(pet);
  }

  async update(
    id: string,
    userId: string,
    updatePetDto: UpdatePetDto,
  ): Promise<PetResponseDto> {
    const pet = await this.ownershipService.verifyDirectOwnership(
      this.petsRepository,
      id,
      userId,
      ERROR_MESSAGES.PET.NOT_FOUND,
      ERROR_MESSAGES.PET.NOT_OWNED,
    );

    Object.assign(pet, updatePetDto);
    const updatedPet = await this.petsRepository.save(pet);

    return this.mapToResponseDto(updatedPet);
  }

  async remove(id: string, userId: string): Promise<void> {
    const pet = await this.ownershipService.verifyDirectOwnership(
      this.petsRepository,
      id,
      userId,
      ERROR_MESSAGES.PET.NOT_FOUND,
      ERROR_MESSAGES.PET.NOT_OWNED,
    );

    await this.petsRepository.remove(pet);
  }

  private mapToResponseDto(pet: PetEntity): PetResponseDto {
    return {
      id: pet.id,
      userId: pet.userId,
      name: pet.name,
      species: pet.species,
      weight: pet.weight,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
    };
  }
}