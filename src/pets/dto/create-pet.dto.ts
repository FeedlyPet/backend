import { IsEnum, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PetSpecies } from '../../common/enums/PetSpecies';

export class CreatePetDto {
  @ApiProperty({
    description: 'Name of the pet',
    example: 'Fluffy',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Species of the pet',
    enum: PetSpecies,
    example: PetSpecies.CAT,
  })
  @IsEnum(PetSpecies)
  @IsNotEmpty()
  species: PetSpecies;

  @ApiProperty({
    description: 'Weight of the pet in kilograms',
    example: 4.5,
    minimum: 0.1,
    maximum: 200,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.1)
  @Max(200)
  weight: number;
}
