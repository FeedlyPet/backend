import { ApiProperty } from '@nestjs/swagger';
import { DeviceResponseDto } from './device-response.dto';

export class DeviceWithPasswordResponseDto extends DeviceResponseDto {
  @ApiProperty({
    description: 'MQTT password for device authentication (only shown once)',
  })
  mqttPassword: string;
}