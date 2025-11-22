import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum DeviceSortBy {
  NAME = 'name',
  DEVICE_ID = 'deviceId',
  LOCATION = 'location',
  IS_ONLINE = 'isOnline',
  LAST_SEEN = 'lastSeen',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class QueryDevicesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: DeviceSortBy,
    default: DeviceSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(DeviceSortBy)
  sortBy?: DeviceSortBy = DeviceSortBy.CREATED_AT;
}