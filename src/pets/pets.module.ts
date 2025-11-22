import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { PetEntity } from '../common/entities';
import { OwnershipService } from '../common/services';

@Module({
  imports: [TypeOrmModule.forFeature([PetEntity])],
  controllers: [PetsController],
  providers: [PetsService, OwnershipService],
  exports: [PetsService],
})
export class PetsModule {}