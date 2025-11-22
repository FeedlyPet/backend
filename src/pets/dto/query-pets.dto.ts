import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum PetSortBy {
  NAME = 'name',
  SPECIES = 'species',
  WEIGHT = 'weight',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class QueryPetsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: PetSortBy,
    default: PetSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(PetSortBy)
  sortBy?: PetSortBy = PetSortBy.CREATED_AT;
}