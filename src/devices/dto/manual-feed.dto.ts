import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

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

export class ManualFeedResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Message' })
  message: string;

  @ApiProperty({ description: 'Command sent to device', required: false })
  commandSent?: boolean;
}