import { ApiProperty } from '@nestjs/swagger';

export class DailyBreakdownDto {
  @ApiProperty({ description: 'Date', example: '2025-11-01' })
  date: string;

  @ApiProperty({ description: 'Number of feedings on this day' })
  feedings: number;

  @ApiProperty({ description: 'Total food dispensed on this day (grams)' })
  food: number;
}
