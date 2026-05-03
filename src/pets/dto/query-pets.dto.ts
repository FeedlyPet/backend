import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PetSortBy } from './pet-sort-by';

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
