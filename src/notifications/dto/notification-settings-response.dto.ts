import { ApiProperty } from '@nestjs/swagger';

export class NotificationSettingsResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Receive notifications for successful feedings' })
  feedingSuccess: boolean;

  @ApiProperty({ description: 'Receive notifications for failed feedings' })
  feedingFailed: boolean;

  @ApiProperty({ description: 'Receive notifications for low food level' })
  lowFoodLevel: boolean;

  @ApiProperty({ description: 'Receive notifications for device status changes' })
  deviceStatus: boolean;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}