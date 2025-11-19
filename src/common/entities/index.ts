import { PetSpecies } from '../enums/PetSpecies';
import { FeedingType } from '../enums/FeedingType';
import { NotificationType } from '../enums/NotificationType';

export { PetSpecies } from '../enums/PetSpecies';
export { FeedingType } from '../enums/FeedingType';
export { NotificationType } from '../enums/NotificationType';

export { UserEntity } from './UserEntity';
export { PetEntity } from './PetEntity';
export { DeviceEntity } from './DeviceEntity';
export { ScheduleEntity } from './ScheduleEntity';
export { FeedingEventEntity } from './FeedingEventEntity';
export { FoodLevelEntity } from './FoodLevelEntity';
export { NotificationEntity } from './NotificationEntity';
export { NotificationSettingsEntity } from './NotificationSettingsEntity';
export { RefreshTokenEntity } from './RefreshTokenEntity';
export { PasswordResetEntity } from './PasswordResetEntity';
export { EmailVerificationEntity } from './EmailVerificationEntity';

import { UserEntity } from './UserEntity';
import { PetEntity } from './PetEntity';
import { DeviceEntity } from './DeviceEntity';
import { ScheduleEntity } from './ScheduleEntity';
import { FeedingEventEntity } from './FeedingEventEntity';
import { FoodLevelEntity } from './FoodLevelEntity';
import { NotificationEntity } from './NotificationEntity';
import { NotificationSettingsEntity } from './NotificationSettingsEntity';
import { RefreshTokenEntity } from './RefreshTokenEntity';
import { PasswordResetEntity } from './PasswordResetEntity';
import { EmailVerificationEntity } from './EmailVerificationEntity';

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