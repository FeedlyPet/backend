import { IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PetSpecies } from '../../common/enums/pet-species';

export class UpdatePetDto {
  @ApiProperty({
    description: 'Name of the pet',
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
    required: false,
  })
  @IsEnum(PetSpecies)
  @IsOptional()
  species?: PetSpecies;

  @ApiProperty({
    description: 'Weight of the pet in kilograms',
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