import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FoodLevelSortBy } from './food-level-sort-by';

export class QueryFoodLevelsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: FoodLevelSortBy,
    default: FoodLevelSortBy.TIMESTAMP,
  })
  @IsOptional()
  @IsEnum(FoodLevelSortBy)
  sortBy?: FoodLevelSortBy = FoodLevelSortBy.TIMESTAMP;

  @ApiPropertyOptional({
    description: 'Filter records from this date (ISO 8601 format)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter records until this date (ISO 8601 format)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
