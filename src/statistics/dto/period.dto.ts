import { ApiProperty } from '@nestjs/swagger';

export class PeriodDto {
  @ApiProperty({ description: 'Period start date', example: '2025-11-01' })
  start: string;

  @ApiProperty({ description: 'Period end date', example: '2025-11-07' })
  end: string;
}
