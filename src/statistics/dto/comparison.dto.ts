import { ApiProperty } from '@nestjs/swagger';

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
