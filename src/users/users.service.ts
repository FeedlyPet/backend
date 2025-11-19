import {ConflictException, Injectable, NotFoundException, UnauthorizedException,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {UserEntity} from '../common/entities';
import {ChangePasswordDto, UpdateProfileDto} from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async getProfile(userId: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'email', 'name', 'timezone', 'isEmailVerified', 'createdAt', 'updatedAt'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateProfileDto.email },
            });

            if (existingUser) {
                throw new ConflictException('Email already in use');
            }

            user.isEmailVerified = false;
            user.emailVerifiedAt = null;
        }

        if (updateProfileDto.name !== undefined) {
            user.name = updateProfileDto.name;
        }

        if (updateProfileDto.email !== undefined) {
            user.email = updateProfileDto.email;
        }

        if (updateProfileDto.timezone !== undefined) {
            user.timezone = updateProfileDto.timezone;
        }

        await this.userRepository.save(user);

        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword as UserEntity;
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'passwordHash'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
            changePasswordDto.currentPassword,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);

        await this.userRepository.save(user);
    }
}
