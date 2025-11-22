import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Type } from 'class-transformer';

export enum ScheduleSortBy {
  FEEDING_TIME = 'feedingTime',
  PORTION_SIZE = 'portionSize',
  IS_ACTIVE = 'isActive',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class QuerySchedulesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ScheduleSortBy,
    default: ScheduleSortBy.FEEDING_TIME,
  })
  @IsOptional()
  @IsEnum(ScheduleSortBy)
  sortBy?: ScheduleSortBy = ScheduleSortBy.FEEDING_TIME;

  @ApiPropertyOptional({
    description: 'Filter by active status',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
