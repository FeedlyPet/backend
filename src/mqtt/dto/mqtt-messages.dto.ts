export interface FeedCommandPayload {
  type: 'feed';
  portionSize: number;
  timestamp: string;
  scheduleId?: string;
}

export interface ConfigCommandPayload {
  servoSpeed?: number;
  foodLevelCheckInterval?: number;
  heartbeatInterval?: number;
  maxPortionSize?: number;
}

export interface DeviceStatusPayload {
  online: boolean;
  foodLevel?: number;
  wifiSignal?: number;
  uptime?: number;
  firmwareVersion?: string;
  timestamp: string;
}

export interface FeedingEventPayload {
  deviceId: string;
  portionSize: number;
  success: boolean;
  type: 'automatic' | 'manual';
  scheduleId?: string;
  errorMessage?: string;
  timestamp: string;
}

export interface FoodLevelPayload {
  deviceId: string;
  level: number;
  timestamp: string;
}

export interface DeviceErrorPayload {
  deviceId: string;
  errorCode: string;
  errorMessage: string;
  timestamp: string;
}