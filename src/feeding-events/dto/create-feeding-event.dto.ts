import { IsNotEmpty, IsInt, Min, Max, IsEnum, IsUUID, IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedingType } from '../../common/enums/feeding-type';

export class CreateFeedingEventDto {
  @ApiProperty({
    description: 'Device ID that performed the feeding',
  })
  @IsUUID()
  @IsNotEmpty()
  deviceId: string;

  @ApiPropertyOptional({
    description: 'Pet ID that was fed',
  })
  @IsOptional()
  @IsUUID()
  petId?: string;

  @ApiPropertyOptional({
    description: 'Schedule ID if this was an automatic feeding',
  })
  @IsOptional()
  @IsUUID()
  scheduleId?: string;

  @ApiProperty({
    description: 'Portion size in grams',
    minimum: 10,
    maximum: 500,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(10)
  @Max(500)
  portionSize: number;

  @ApiProperty({
    description: 'Type of feeding',
    enum: FeedingType,
  })
  @IsEnum(FeedingType)
  @IsNotEmpty()
  type: FeedingType;

  @ApiPropertyOptional({
    description: 'Whether the feeding was successful',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  success?: boolean;

  @ApiPropertyOptional({
    description: 'Error message if feeding failed',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}