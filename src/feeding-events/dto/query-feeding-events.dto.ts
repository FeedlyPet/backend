import { IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Type } from 'class-transformer';
import { FeedingType } from '../../common/enums/feeding-type';

export enum FeedingEventSortBy {
  TIMESTAMP = 'timestamp',
  PORTION_SIZE = 'portionSize',
  TYPE = 'type',
  SUCCESS = 'success',
  CREATED_AT = 'createdAt',
}

export class QueryFeedingEventsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: FeedingEventSortBy,
    default: FeedingEventSortBy.TIMESTAMP,
  })
  @IsOptional()
  @IsEnum(FeedingEventSortBy)
  sortBy?: FeedingEventSortBy = FeedingEventSortBy.TIMESTAMP;

  @ApiPropertyOptional({
    description: 'Filter by feeding type',
    enum: FeedingType,
  })
  @IsOptional()
  @IsEnum(FeedingType)
  type?: FeedingType;

  @ApiPropertyOptional({
    description: 'Filter by success status',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  success?: boolean;

  @ApiPropertyOptional({
    description: 'Filter events from this date (ISO 8601 format)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter events until this date (ISO 8601 format)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}