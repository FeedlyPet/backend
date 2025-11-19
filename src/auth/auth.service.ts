import {BadRequestException, Injectable, NotFoundException, UnauthorizedException,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {EmailVerificationEntity, PasswordResetEntity, RefreshTokenEntity, UserEntity} from '../common/entities';
import {ForgotPasswordDto, LoginDto, RegisterDto, ResendVerificationDto, ResetPasswordDto, VerifyEmailDto} from './dto';
import {EmailService} from './email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(PasswordResetEntity)
    private passwordResetRepository: Repository<PasswordResetEntity>,
    @InjectRepository(EmailVerificationEntity)
    private emailVerificationRepository: Repository<EmailVerificationEntity>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, timezone } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      passwordHash,
      name,
      timezone: timezone || 'UTC',
    });

    await this.userRepository.save(user);

    await this.sendVerificationEmail(user.id);

    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        timezone: user.timezone,
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        timezone: user.timezone,
      },
      ...tokens,
    };
  }

  async logout(userId: string, refreshToken: string) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );

    return { message: 'Logout successful' };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const storedToken = await this.refreshTokenRepository.findOne({
        where: {
          userId: payload.sub,
          isRevoked: false,
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (new Date() > storedToken.expiresAt) {
        throw new UnauthorizedException('Refresh token expired');
      }

      await this.refreshTokenRepository.update(
        { id: storedToken.id },
        { isRevoked: true },
      );

      return await this.generateTokens(payload.sub);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        message: 'If the user exists, password reset instructions will be sent to the email',
      };
    }

    const resetToken = this.generateRandomToken();
    const tokenHash = await bcrypt.hash(resetToken, 10);

    const passwordReset = this.passwordResetRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      isUsed: false,
    });

    await this.passwordResetRepository.save(passwordReset);

    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken, user.name);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return {
      message: 'If the user exists, password reset instructions will be sent to the email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const passwordResets = await this.passwordResetRepository.find({
      where: { isUsed: false },
      relations: ['user'],
    });

    let validReset: PasswordResetEntity | null = null;

    for (const reset of passwordResets) {
      const isValid = await bcrypt.compare(token, reset.tokenHash);
      if (isValid) {
        validReset = reset;
        break;
      }
    }

    if (!validReset) {
      throw new BadRequestException('Invalid or expired token');
    }

    if (new Date() > validReset.expiresAt) {
      throw new BadRequestException('Invalid or expired token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(
      { id: validReset.userId },
      { passwordHash },
    );

    await this.passwordResetRepository.update(
      { id: validReset.id },
      { isUsed: true },
    );

    await this.refreshTokenRepository.update(
      { userId: validReset.userId },
      { isRevoked: true },
    );

    return { message: 'Password successfully changed' };
  }

  async validateUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
    };
  }

  async sendVerificationEmail(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const verificationToken = this.generateRandomToken();
    const tokenHash = await bcrypt.hash(verificationToken, 10);

    const emailVerification = this.emailVerificationRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isUsed: false,
    });

    await this.emailVerificationRepository.save(emailVerification);

    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.name,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    return verificationToken;
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token } = verifyEmailDto;

    const verifications = await this.emailVerificationRepository.find({
      where: { isUsed: false },
      relations: ['user'],
    });

    let validVerification: EmailVerificationEntity | null = null;

    for (const verification of verifications) {
      const isValid = await bcrypt.compare(token, verification.tokenHash);
      if (isValid) {
        validVerification = verification;
        break;
      }
    }

    if (!validVerification) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (new Date() > validVerification.expiresAt) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (validVerification.user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.userRepository.update(
      { id: validVerification.userId },
      { isEmailVerified: true, emailVerifiedAt: new Date() },
    );

    await this.emailVerificationRepository.update(
      { id: validVerification.id },
      { isUsed: true },
    );

    return { message: 'Email successfully verified' };
  }

  async resendVerificationEmail(resendDto: ResendVerificationDto) {
    const { email } = resendDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        message: 'If the user exists and email is not verified, verification email will be sent',
      };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.sendVerificationEmail(user.id);

    return {
      message: 'Verification email sent',
    };
  }

  private generateRandomToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
