import { ApiProperty } from '@nestjs/swagger';

export class DeviceResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the device',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns the device',
  })
  userId: string;

  @ApiProperty({
    description: 'Pet ID associated with this device',
    nullable: true,
  })
  petId: string | null;

  @ApiProperty({
    description: 'Unique hardware identifier',
  })
  deviceId: string;

  @ApiProperty({
    description: 'Name of the device',
  })
  name: string;

  @ApiProperty({
    description: 'Location of the device',
    nullable: true,
  })
  location: string | null;

  @ApiProperty({
    description: 'Online status of the device',
  })
  isOnline: boolean;

  @ApiProperty({
    description: 'Last time the device was seen online',
    nullable: true,
  })
  lastSeen: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}