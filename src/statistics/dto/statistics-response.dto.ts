import { ApiProperty } from '@nestjs/swagger';

export class DailyBreakdownDto {
  @ApiProperty({ description: 'Date', example: '2025-11-01' })
  date: string;

  @ApiProperty({ description: 'Number of feedings on this day' })
  feedings: number;

  @ApiProperty({ description: 'Total food dispensed on this day (grams)' })
  food: number;
}

export class PeriodDto {
  @ApiProperty({ description: 'Period start date', example: '2025-11-01' })
  start: string;

  @ApiProperty({ description: 'Period end date', example: '2025-11-07' })
  end: string;
}

export class ComparisonDto {
  @ApiProperty({ description: 'Total feedings in previous period' })
  previousFeedings: number;

  @ApiProperty({ description: 'Total food in previous period (grams)' })
  previousFood: number;

  @ApiProperty({ description: 'Feedings change percentage' })
  feedingsChange: number;

  @ApiProperty({ description: 'Food change percentage' })
  foodChange: number;
}

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

  @ApiProperty({ description: 'Comparison with previous period', type: ComparisonDto })
  comparison: ComparisonDto;
}