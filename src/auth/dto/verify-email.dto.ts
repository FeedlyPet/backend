import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
    @ApiProperty({
        description: 'Email verification token',
    })
    @IsNotEmpty({ message: 'Verification token required.' })
    @IsString({ message: 'Token must be a string.' })
    token: string;
}