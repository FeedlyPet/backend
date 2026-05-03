import { ApiProperty } from '@nestjs/swagger';

export class DevicePetDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() species: string;
}
