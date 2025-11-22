import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FoodLevelResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the food level record',
  })
  id: string;

  @ApiProperty({
    description: 'Device ID',
  })
  deviceId: string;

  @ApiProperty({
    description: 'Food level percentage (0-100)',
  })
  level: number;

  @ApiPropertyOptional({
    description: 'Estimated days until food runs out',
  })
  estimatedDaysLeft: number | null;

  @ApiProperty({
    description: 'Timestamp when the level was recorded',
  })
  timestamp: Date;
}