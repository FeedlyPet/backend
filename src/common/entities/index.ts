import { PetSpecies } from '../enums/pet-species';
import { FeedingType } from '../enums/feeding-type';
import { NotificationType } from '../enums/notification-type';

export { PetSpecies } from '../enums/pet-species';
export { FeedingType } from '../enums/feeding-type';
export { NotificationType } from '../enums/notification-type';

export { UserEntity } from './user.entity';
export { PetEntity } from './pet.entity';
export { DeviceEntity } from './device.entity';
export { ScheduleEntity } from './schedule.entity';
export { FeedingEventEntity } from './feeding-event.entity';
export { FoodLevelEntity } from './food-level.entity';
export { NotificationEntity } from './notification.entity';
export { NotificationSettingsEntity } from './notification-settings.entity';
export { RefreshTokenEntity } from './refresh-token.entity';
export { PasswordResetEntity } from './password-reset.entity';
export { EmailVerificationEntity } from './email-verification.entity';

import { UserEntity } from './user.entity';
import { PetEntity } from './pet.entity';
import { DeviceEntity } from './device.entity';
import { ScheduleEntity } from './schedule.entity';
import { FeedingEventEntity } from './feeding-event.entity';
import { FoodLevelEntity } from './food-level.entity';
import { NotificationEntity } from './notification.entity';
import { NotificationSettingsEntity } from './notification-settings.entity';
import { RefreshTokenEntity } from './refresh-token.entity';
import { PasswordResetEntity } from './password-reset.entity';
import { EmailVerificationEntity } from './email-verification.entity';

export const entities = [
    UserEntity,
    PetEntity,
    DeviceEntity,
    ScheduleEntity,
    FeedingEventEntity,
    FoodLevelEntity,
    NotificationEntity,
    NotificationSettingsEntity,
    RefreshTokenEntity,
    PasswordResetEntity,
    EmailVerificationEntity,
];