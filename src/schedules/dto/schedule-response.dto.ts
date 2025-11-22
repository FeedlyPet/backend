import { ApiProperty } from '@nestjs/swagger';

export class ScheduleResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the schedule',
  })
  id: string;

  @ApiProperty({
    description: 'Device ID this schedule belongs to',
  })
  deviceId: string;

  @ApiProperty({
    description: 'Feeding time in HH:MM format',
  })
  feedingTime: string;

  @ApiProperty({
    description: 'Portion size in grams',
  })
  portionSize: number;

  @ApiProperty({
    description: 'Whether the schedule is active',
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Days of the week when feeding should occur',
    type: [String],
  })
  daysOfWeek: string[];

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}