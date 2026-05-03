import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { StatisticsPeriod } from './statistics-period';

export class QueryStatisticsDto {
  @ApiPropertyOptional({
    description: 'Predefined period for statistics',
    enum: StatisticsPeriod,
  })
  @IsOptional()
  @IsEnum(StatisticsPeriod)
  period?: StatisticsPeriod;

  @ApiPropertyOptional({
    description: 'Start date for custom period (ISO 8601)',
    example: '2025-11-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for custom period (ISO 8601)',
    example: '2025-11-07',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
