import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Receive notifications for successful feedings' })
  @IsOptional()
  @IsBoolean()
  feedingSuccess?: boolean;

  @ApiPropertyOptional({ description: 'Receive notifications for failed feedings' })
  @IsOptional()
  @IsBoolean()
  feedingFailed?: boolean;

  @ApiPropertyOptional({ description: 'Receive notifications for low food level' })
  @IsOptional()
  @IsBoolean()
  lowFoodLevel?: boolean;

  @ApiPropertyOptional({ description: 'Receive notifications for device status changes' })
  @IsOptional()
  @IsBoolean()
  deviceStatus?: boolean;
}