import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { DeviceSortBy } from './device-sort-by';

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
