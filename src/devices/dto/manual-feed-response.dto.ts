import { ApiProperty } from '@nestjs/swagger';

export class ManualFeedResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Message' })
  message: string;

  @ApiProperty({ description: 'Command sent to device', required: false })
  commandSent?: boolean;
}
