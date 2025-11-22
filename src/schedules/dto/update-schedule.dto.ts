import { IsOptional, IsInt, Min, Max, IsBoolean, IsArray, ArrayMinSize, ArrayMaxSize, IsIn, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VALID_DAYS } from './create-schedule.dto';

export class UpdateScheduleDto {
  @ApiProperty({
    description: 'Feeding time in HH:MM format',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
    required: false,
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'feedingTime must be in HH:MM format (00:00 - 23:59)',
  })
  feedingTime?: string;

  @ApiProperty({
    description: 'Portion size in grams',
    minimum: 10,
    maximum: 500,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(10, { message: 'Portion size must be at least 10 grams' })
  @Max(500, { message: 'Portion size must not exceed 500 grams' })
  portionSize?: number;

  @ApiProperty({
    description: 'Whether the schedule is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Days of the week when feeding should occur',
    type: [String],
    enum: VALID_DAYS,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one day must be selected' })
  @ArrayMaxSize(7, { message: 'Cannot have more than 7 days' })
  @IsIn(VALID_DAYS, { each: true, message: 'Invalid day of week' })
  daysOfWeek?: string[];
}