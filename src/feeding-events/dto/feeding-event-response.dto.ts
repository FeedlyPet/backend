import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedingType } from '../../common/enums/feeding-type';

export class FeedingEventResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the feeding event',
  })
  id: string;

  @ApiProperty({
    description: 'Device ID that performed the feeding',
  })
  deviceId: string;

  @ApiPropertyOptional({
    description: 'Pet ID that was fed',
  })
  petId: string | null;

  @ApiPropertyOptional({
    description: 'Schedule ID if this was an automatic feeding',
  })
  scheduleId: string | null;

  @ApiProperty({
    description: 'Timestamp when the feeding occurred',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Portion size in grams',
  })
  portionSize: number;

  @ApiProperty({
    description: 'Type of feeding',
    enum: FeedingType,
  })
  type: FeedingType;

  @ApiProperty({
    description: 'Whether the feeding was successful',
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Error message if feeding failed',
  })
  errorMessage: string | null;

  @ApiPropertyOptional({
    description: 'URL to photo taken during feeding',
  })
  photoUrl: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;
}