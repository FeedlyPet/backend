import {
    Controller,
    Get,
    Patch,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../common/entities';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@CurrentUser() user: UserEntity): Promise<UserEntity> {
        return this.usersService.getProfile(user.id);
    }

    @Patch('profile')
    @ApiOperation({ summary: 'Update user profile' })
    async updateProfile(
        @CurrentUser() user: UserEntity,
        @Body(ValidationPipe) updateProfileDto: UpdateProfileDto,
    ): Promise<UserEntity> {
        return this.usersService.updateProfile(user.id, updateProfileDto);
    }

    @Patch('password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Change user password' })
    async changePassword(
        @CurrentUser() user: UserEntity,
        @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
    ): Promise<void> {
        return this.usersService.changePassword(user.id, changePasswordDto);
    }
}