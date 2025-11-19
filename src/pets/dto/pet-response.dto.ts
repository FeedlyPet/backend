import { ApiProperty } from '@nestjs/swagger';
import { PetSpecies } from '../../common/enums/PetSpecies';

export class PetResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the pet',
    example: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns the pet',
    example: 'b4cc290f-9cg0-4999-0023-bdf5f7654113',
  })
  userId: string;

  @ApiProperty({
    description: 'Name of the pet',
    example: 'Fluffy',
  })
  name: string;

  @ApiProperty({
    description: 'Species of the pet',
    enum: PetSpecies,
    example: PetSpecies.CAT,
  })
  species: PetSpecies;

  @ApiProperty({
    description: 'Weight of the pet in kilograms',
    example: 4.5,
  })
  weight: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-18T20:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-18T20:30:00.000Z',
  })
  updatedAt: Date;
}