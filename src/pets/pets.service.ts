import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetEntity } from '../common/entities';
import { CreatePetDto, UpdatePetDto, PetResponseDto } from './dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(PetEntity)
    private petsRepository: Repository<PetEntity>,
  ) {}

  async create(userId: string, createPetDto: CreatePetDto): Promise<PetResponseDto> {
    const pet = this.petsRepository.create({
      ...createPetDto,
      userId,
    });

    const savedPet = await this.petsRepository.save(pet);
    return this.mapToResponseDto(savedPet);
  }

  async findAll(userId: string): Promise<PetResponseDto[]> {
    const pets = await this.petsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return pets.map((pet) => this.mapToResponseDto(pet));
  }

  async findOne(id: string, userId: string): Promise<PetResponseDto> {
    const pet = await this.petsRepository.findOne({
      where: { id },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.userId !== userId) {
      throw new ForbiddenException('You do not have access to this pet');
    }

    return this.mapToResponseDto(pet);
  }

  async update(id: string, userId: string, updatePetDto: UpdatePetDto): Promise<PetResponseDto> {
    const pet = await this.petsRepository.findOne({
      where: { id },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.userId !== userId) {
      throw new ForbiddenException('You do not have access to this pet');
    }

    Object.assign(pet, updatePetDto);
    const updatedPet = await this.petsRepository.save(pet);

    return this.mapToResponseDto(updatedPet);
  }

  async remove(id: string, userId: string): Promise<void> {
    const pet = await this.petsRepository.findOne({
      where: { id },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.userId !== userId) {
      throw new ForbiddenException('You do not have access to this pet');
    }

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