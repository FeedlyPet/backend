import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class ManualFeedDto {
  @ApiProperty({
    description: 'Portion size in grams',
    example: 50,
    minimum: 10,
    maximum: 500,
  })
  @IsInt()
  @Min(10, { message: 'Portion size must be at least 10 grams' })
  @Max(500, { message: 'Portion size must not exceed 500 grams' })
  portionSize: number;
}
