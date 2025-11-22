import { ApiProperty } from '@nestjs/swagger';
import { PetSpecies } from '../../common/enums/pet-species';

export class PetResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the pet',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns the pet',
  })
  userId: string;

  @ApiProperty({
    description: 'Name of the pet',
  })
  name: string;

  @ApiProperty({
    description: 'Species of the pet',
    enum: PetSpecies,
  })
  species: PetSpecies;

  @ApiProperty({
    description: 'Weight of the pet in kilograms',
  })
  weight: number;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}