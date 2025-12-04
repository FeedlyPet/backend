import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { QueryStatisticsDto, StatisticsResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('feeding/:deviceId')
  @ApiOperation({ summary: 'Get feeding statistics for a device' })
  @ApiParam({ name: 'deviceId', description: 'Device ID' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Device does not belong to user',
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
  })
  async getDeviceStatistics(
    @CurrentUser() user: any,
    @Param('deviceId') deviceId: string,
    @Query(ValidationPipe) query: QueryStatisticsDto,
  ): Promise<StatisticsResponseDto> {
    return this.statisticsService.getDeviceStatistics(user.id, deviceId, query);
  }
}