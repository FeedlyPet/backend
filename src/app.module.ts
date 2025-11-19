import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { typeOrmConfig } from "./common/typeorm.config";
import { DeviceEntity } from './common/entities';
import { FeedingEventEntity } from './common/entities';
import { FoodLevelEntity } from './common/entities';
import { NotificationEntity } from './common/entities';
import { NotificationSettingsEntity } from './common/entities';
import { PetEntity } from './common/entities';
import { ScheduleEntity } from './common/entities';
import { UserEntity } from './common/entities';
import { RefreshTokenEntity } from './common/entities';
import { PasswordResetEntity } from './common/entities';
import { EmailVerificationEntity } from './common/entities';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PetsModule } from './pets/pets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...typeOrmConfig,
      entities: [
          DeviceEntity,
          FeedingEventEntity,
          FoodLevelEntity,
          NotificationEntity,
          NotificationSettingsEntity,
          PetEntity,
          ScheduleEntity,
          UserEntity,
          RefreshTokenEntity,
          PasswordResetEntity,
          EmailVerificationEntity,
      ]
    }),
    AuthModule,
    UsersModule,
    PetsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}