import { IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PetSpecies } from '../../common/enums/PetSpecies';

export class UpdatePetDto {
  @ApiProperty({
    description: 'Name of the pet',
    example: 'Fluffy',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Species of the pet',
    enum: PetSpecies,
    example: PetSpecies.CAT,
    required: false,
  })
  @IsEnum(PetSpecies)
  @IsOptional()
  species?: PetSpecies;

  @ApiProperty({
    description: 'Weight of the pet in kilograms',
    example: 5.2,
    minimum: 0.1,
    maximum: 200,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(200)
  weight?: number;
}