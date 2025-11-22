import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiPropertyOptional({
        description: 'User full name',
        minLength: 2,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    name?: string;

    @ApiPropertyOptional({
        description: 'User email address',
    })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;

    @ApiPropertyOptional({
        description: 'User timezone (IANA format)',
        maxLength: 50,
    })
    @IsOptional()
    @IsString()
    @MaxLength(50, { message: 'Timezone must not exceed 50 characters' })
    timezone?: string;
}