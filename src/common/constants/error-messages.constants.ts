export const ERROR_MESSAGES = {
  UNAUTHORIZED_ACCESS: 'You do not have access to this resource',
  FORBIDDEN_ACTION: 'You are not allowed to perform this action',

  DEVICE: {
    NOT_FOUND: 'Device not found',
    NOT_OWNED: 'Device not found or does not belong to you',
    ALREADY_ASSIGNED: 'Device is already assigned to another pet',
    INVALID_ID: 'Invalid device ID format',
  },

  PET: {
    NOT_FOUND: 'Pet not found',
    NOT_OWNED: 'Pet not found or does not belong to you',
    INVALID_ID: 'Invalid pet ID format',
  },

  SCHEDULE: {
    NOT_FOUND: 'Schedule not found',
    NOT_OWNED: 'Schedule not found or you do not have access to it',
    MAX_ACTIVE_REACHED: 'Maximum number of active schedules (10) reached for this device',
    MIN_INTERVAL_NOT_MET: 'Feeding times must be at least 2 hours apart on the same days',
    INVALID_TIME_FORMAT: 'Invalid time format. Use HH:MM format (00:00 - 23:59)',
  },

  FEEDING_EVENT: {
    NOT_FOUND: 'Feeding event not found',
    NOT_OWNED: 'Feeding event not found or you do not have access to it',
  },

  FOOD_LEVEL: {
    NOT_FOUND: 'No food level data found for this device',
    INVALID_LEVEL: 'Food level must be between 0 and 100',
  },

  USER: {
    NOT_FOUND: 'User not found',
    EMAIL_IN_USE: 'Email is already in use',
  },

  NOTIFICATION: {
    NOT_FOUND: 'Notification not found',
    NOT_OWNED: 'Notification not found or does not belong to you',
    SETTINGS_NOT_FOUND: 'Notification settings not found',
  },
} as const;