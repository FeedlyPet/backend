import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { EmailRateLimiterService } from './email-rate-limiter.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserEntity } from '../common/entities';
import { RefreshTokenEntity } from '../common/entities';
import { PasswordResetEntity } from '../common/entities';
import { EmailVerificationEntity } from '../common/entities';
import { EmailLogEntity } from '../common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RefreshTokenEntity,
      PasswordResetEntity,
      EmailVerificationEntity,
      EmailLogEntity,
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, EmailRateLimiterService, JwtStrategy],
  exports: [AuthService, EmailService],
})
export class AuthModule {}
