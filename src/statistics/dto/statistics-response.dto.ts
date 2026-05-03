import { ApiProperty } from '@nestjs/swagger';
import { PeriodDto } from './period.dto';
import { ComparisonDto } from './comparison.dto';
import { DailyBreakdownDto } from './daily-breakdown.dto';

export class StatisticsResponseDto {
  @ApiProperty({ description: 'Total number of feedings in the period' })
  totalFeedings: number;

  @ApiProperty({ description: 'Total food dispensed in the period (grams)' })
  totalFood: number;

  @ApiProperty({ description: 'Average portion size (grams)' })
  averagePortion: number;

  @ApiProperty({ description: 'Number of successful feedings' })
  successfulFeedings: number;

  @ApiProperty({ description: 'Number of failed feedings' })
  failedFeedings: number;

  @ApiProperty({ description: 'Number of automatic feedings' })
  automaticFeedings: number;

  @ApiProperty({ description: 'Number of manual feedings' })
  manualFeedings: number;

  @ApiProperty({ description: 'Period information', type: PeriodDto })
  period: PeriodDto;

  @ApiProperty({ description: 'Daily breakdown', type: [DailyBreakdownDto] })
  dailyBreakdown: DailyBreakdownDto[];

  @ApiProperty({
    description: 'Comparison with previous period',
    type: ComparisonDto,
  })
  comparison: ComparisonDto;
}
