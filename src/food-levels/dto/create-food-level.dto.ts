import { IsNotEmpty, IsInt, Min, Max, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFoodLevelDto {
  @ApiProperty({
    description: 'Device ID',
  })
  @IsUUID()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'Food level percentage (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(0, {
    message: 'Level must be at least 0%'
  })
  @Max(100, {
    message: 'Level must not exceed 100%'
  })
  level: number;

  @ApiPropertyOptional({
    description: 'Estimated days until food runs out (calculated automatically if not provided)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDaysLeft?: number;
}