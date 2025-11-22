import { IsNotEmpty, IsInt, Min, Max, IsBoolean, IsArray, ArrayMinSize, ArrayMaxSize, IsIn, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const VALID_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export class CreateScheduleDto {
  @ApiProperty({
    description: 'Feeding time in HH:MM format',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'feedingTime must be in HH:MM format (00:00 - 23:59)',
  })
  feedingTime: string;

  @ApiProperty({
    description: 'Portion size in grams',
    minimum: 10,
    maximum: 500,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(10, {
    message: 'Portion size must be at least 10 grams'
  })
  @Max(500, {
    message: 'Portion size must not exceed 500 grams'
  })
  portionSize: number;

  @ApiProperty({
    description: 'Whether the schedule is active',
    default: true,
  })
  @IsBoolean()
  isActive: boolean = true;

  @ApiProperty({
    description: 'Days of the week when feeding should occur',
    type: [String],
    enum: VALID_DAYS,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1, {
    message: 'At least one day must be selected'
  })
  @ArrayMaxSize(7, {
    message: 'Cannot have more than 7 days'
  })
  @IsIn(VALID_DAYS, {
    each: true,
    message: 'Invalid day of week'
  })
  daysOfWeek: string[];
}