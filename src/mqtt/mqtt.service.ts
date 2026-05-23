import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as mqtt from 'mqtt';
import {
  DeviceEntity,
  FeedingEventEntity,
  FoodLevelEntity,
  FeedingType,
  ScheduleEntity,
} from '../common/entities';
import {
  FeedCommandPayload,
  DeviceStatusPayload,
  FeedingEventPayload,
  FoodLevelPayload,
  DeviceErrorPayload,
} from './dto';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/entities';
import { APP_CONFIG } from '../common/constants';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient | null = null;
  private readonly logger = new Logger(MqttService.name);
  private readonly topicPrefix = 'feedlypet';

  constructor(
    private configService: ConfigService,
    @InjectRepository(DeviceEntity)
    private devicesRepository: Repository<DeviceEntity>,
    @InjectRepository(FeedingEventEntity)
    private feedingEventsRepository: Repository<FeedingEventEntity>,
    @InjectRepository(FoodLevelEntity)
    private foodLevelsRepository: Repository<FoodLevelEntity>,
    @InjectRepository(ScheduleEntity)
    private schedulesRepository: Repository<ScheduleEntity>,
    private eventsGateway: EventsGateway,
    private notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    const mqttUrl = this.configService.get<string>('MQTT_BROKER_URL');

    if (!mqttUrl) {
      this.logger.warn('MQTT_BROKER_URL not configured, MQTT service disabled');
      return;
    }

    try {
      this.client = mqtt.connect(mqttUrl, {
        clientId: `feedlypet-backend-${Date.now()}`,
        username: this.configService.get<string>('MQTT_USERNAME'),
        password: this.configService.get<string>('MQTT_PASSWORD'),
        reconnectPeriod: 5000,
        connectTimeout: 30000,
      });

      this.setupEventHandlers();
    } catch (error) {
      this.logger.error('Failed to initialize MQTT client', error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.endAsync();
      this.logger.log('MQTT client disconnected');
    }
  }

  private setupEventHandlers() {
    if (!this.client) return;

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      this.subscribeToTopics();
    });

    this.client.on('error', (error) => {
      this.logger.error('MQTT error', error);
    });

    this.client.on('reconnect', () => {
      this.logger.log('Reconnecting to MQTT broker...');
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message.toString()).catch((error: unknown) => {
        this.logger.error(`Error processing message on topic ${topic}`, error);
      });
    });
  }

  private subscribeToTopics() {
    if (!this.client) return;

    const topics = [
      `${this.topicPrefix}/+/status/online`,
      `${this.topicPrefix}/+/status/food`,
      `${this.topicPrefix}/+/event/feeding`,
      `${this.topicPrefix}/+/error`,
    ];

    topics.forEach((topic) => {
      this.client!.subscribe(topic, { qos: 1 }, (error) => {
        if (error) {
          this.logger.error(`Failed to subscribe to ${topic}`, error);
        } else {
          this.logger.log(`Subscribed to ${topic}`);
        }
      });
    });
  }

  private async handleMessage(topic: string, message: string) {
    const parts = topic.split('/');
    if (parts.length < 3 || parts[0] !== this.topicPrefix) {
      return;
    }

    const deviceId = parts[1];
    const category = parts[2];
    const action = parts[3];

    let payload: unknown;
    try {
      payload = JSON.parse(message) as unknown;
    } catch {
      this.logger.warn(`Invalid JSON message on topic ${topic}`);
      return;
    }

    if (category === 'status' && action === 'online') {
      await this.handleDeviceStatus(deviceId, payload as DeviceStatusPayload);
    } else if (category === 'status' && action === 'food') {
      await this.handleFoodLevel(deviceId, payload as FoodLevelPayload);
    } else if (category === 'event' && action === 'feeding') {
      await this.handleFeedingEvent(deviceId, payload as FeedingEventPayload);
    } else if (category === 'error') {
      this.handleDeviceError(deviceId, payload as DeviceErrorPayload);
    }
  }

  private async handleDeviceStatus(
    hardwareId: string,
    payload: DeviceStatusPayload,
  ) {
    const device = await this.devicesRepository.findOne({
      where: { deviceId: hardwareId },
    });

    if (!device) {
      this.logger.warn(`Unknown device: ${hardwareId}`);
      return;
    }

    device.isOnline = payload.online;
    device.lastSeen = new Date();
    await this.devicesRepository.save(device);

    this.logger.log(
      `Device ${hardwareId} status updated: ${payload.online ? 'online' : 'offline'}`,
    );

    this.eventsGateway.emitDeviceStatus(device.userId, {
      deviceId: device.id,
      isOnline: device.isOnline,
      lastSeen: device.lastSeen.toISOString(),
    });

    const statusNotif = await this.notificationsService.create({
      userId: device.userId,
      deviceId: device.id,
      type: payload.online
        ? NotificationType.DEVICE_ONLINE
        : NotificationType.DEVICE_OFFLINE,
      title: payload.online
        ? `${device.name} is online`
        : `${device.name} is offline`,
      message: payload.online
        ? `Device "${device.name}" has connected.`
        : `Device "${device.name}" has gone offline.`,
    });
    if (statusNotif) {
      this.eventsGateway.emitNotification(device.userId, statusNotif);
    }

    if (payload.foodLevel !== undefined) {
      await this.saveFoodLevel(device.id, payload.foodLevel);
      this.eventsGateway.emitFoodLevel(device.userId, {
        deviceId: device.id,
        level: payload.foodLevel,
      });

      if (payload.foodLevel < APP_CONFIG.FOOD_LEVEL.LOW_LEVEL_THRESHOLD) {
        const lowNotif = await this.notificationsService.create({
          userId: device.userId,
          deviceId: device.id,
          type: NotificationType.LOW_FOOD_LEVEL,
          title: `Low food level — ${device.name}`,
          message: `Food level is at ${payload.foodLevel}% for "${device.name}". Please refill soon.`,
        });
        if (lowNotif) {
          this.eventsGateway.emitNotification(device.userId, lowNotif);
        }
      }
    }
  }

  private async handleFoodLevel(hardwareId: string, payload: FoodLevelPayload) {
    const device = await this.devicesRepository.findOne({
      where: { deviceId: hardwareId },
    });

    if (!device) {
      this.logger.warn(`Unknown device: ${hardwareId}`);
      return;
    }

    await this.saveFoodLevel(device.id, payload.level);
    this.eventsGateway.emitFoodLevel(device.userId, {
      deviceId: device.id,
      level: payload.level,
    });

    if (payload.level < APP_CONFIG.FOOD_LEVEL.LOW_LEVEL_THRESHOLD) {
      const lowNotif = await this.notificationsService.create({
        userId: device.userId,
        deviceId: device.id,
        type: NotificationType.LOW_FOOD_LEVEL,
        title: `Low food level — ${device.name}`,
        message: `Food level is at ${payload.level}% for "${device.name}". Please refill soon.`,
      });
      if (lowNotif) {
        this.eventsGateway.emitNotification(device.userId, lowNotif);
      }
    }
  }

  private async saveFoodLevel(deviceId: string, level: number) {
    const foodLevel = this.foodLevelsRepository.create({
      deviceId,
      level,
      timestamp: new Date(),
    });

    await this.foodLevelsRepository.save(foodLevel);
    this.logger.log(`Food level recorded for device ${deviceId}: ${level}%`);
  }

  private async handleFeedingEvent(
    hardwareId: string,
    payload: FeedingEventPayload,
  ) {
    const device = await this.devicesRepository.findOne({
      where: { deviceId: hardwareId },
    });

    if (!device) {
      this.logger.warn(`Unknown device: ${hardwareId}`);
      return;
    }

    let scheduleId: string | null = null;
    if (payload.scheduleId) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(payload.scheduleId)) {
        const schedule = await this.schedulesRepository.findOne({
          where: { id: payload.scheduleId },
        });

        if (schedule) {
          scheduleId = payload.scheduleId;
        } else {
          this.logger.warn(
            `Schedule not found for device ${hardwareId}: ${payload.scheduleId}`,
          );
        }
      } else {
        this.logger.warn(
          `Invalid scheduleId format from device ${hardwareId}: ${payload.scheduleId}`,
        );
      }
    }

    const feedingEvent = this.feedingEventsRepository.create({
      deviceId: device.id,
      petId: device.petId,
      scheduleId,
      portionSize: payload.portionSize,
      type:
        payload.type === 'automatic'
          ? FeedingType.AUTOMATIC
          : FeedingType.MANUAL,
      success: payload.success,
      errorMessage: payload.errorMessage || null,
      timestamp: new Date(payload.timestamp),
    });

    await this.feedingEventsRepository.save(feedingEvent);
    this.logger.log(
      `Feeding event recorded for device ${hardwareId}: ${payload.portionSize}g`,
    );

    this.eventsGateway.emitFeedingResult(device.userId, {
      deviceId: device.id,
      deviceName: device.name,
      portionSize: payload.portionSize,
      success: payload.success,
      errorMessage: payload.errorMessage,
      timestamp: new Date(payload.timestamp).toISOString(),
    });

    const feedNotif = await this.notificationsService.create({
      userId: device.userId,
      deviceId: device.id,
      type: payload.success
        ? NotificationType.FEEDING_SUCCESS
        : NotificationType.FEEDING_FAILED,
      title: payload.success
        ? `Fed ${device.name}`
        : `Feeding failed for ${device.name}`,
      message: payload.success
        ? `Successfully dispensed ${payload.portionSize}g for "${device.name}".`
        : `Failed to dispense food for "${device.name}": ${payload.errorMessage ?? 'unknown error'}.`,
    });
    if (feedNotif) {
      this.eventsGateway.emitNotification(device.userId, feedNotif);
    }
  }

  private handleDeviceError(hardwareId: string, payload: DeviceErrorPayload) {
    this.logger.error(
      `Device error from ${hardwareId}: [${payload.errorCode}] ${payload.errorMessage}`,
    );
  }

  async sendFeedCommand(
    hardwareId: string,
    portionSize: number,
    scheduleId?: string,
  ): Promise<boolean> {
    if (!this.client || !this.client.connected) {
      this.logger.warn('MQTT client not connected');
      return false;
    }

    const topic = `${this.topicPrefix}/${hardwareId}/command/feed`;
    const payload: FeedCommandPayload = {
      type: 'feed',
      portionSize,
      timestamp: new Date().toISOString(),
      scheduleId,
    };

    return new Promise((resolve) => {
      this.client!.publish(
        topic,
        JSON.stringify(payload),
        { qos: 1 },
        (error) => {
          if (error) {
            this.logger.error(
              `Failed to send feed command to ${hardwareId}`,
              error,
            );
            resolve(false);
          } else {
            this.logger.log(
              `Feed command sent to ${hardwareId}: ${portionSize}g`,
            );
            resolve(true);
          }
        },
      );
    });
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkOfflineDevices() {
    const threshold = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes
    const staleDevices = await this.devicesRepository.find({
      where: { isOnline: true, lastSeen: LessThan(threshold) },
    });

    for (const device of staleDevices) {
      device.isOnline = false;
      await this.devicesRepository.save(device);

      this.logger.log(`Device ${device.deviceId} marked offline (no heartbeat)`);

      this.eventsGateway.emitDeviceStatus(device.userId, {
        deviceId: device.id,
        isOnline: false,
        lastSeen: device.lastSeen?.toISOString() ?? new Date().toISOString(),
      });

      const notif = await this.notificationsService.create({
        userId: device.userId,
        deviceId: device.id,
        type: NotificationType.DEVICE_OFFLINE,
        title: `${device.name} is offline`,
        message: `Device "${device.name}" has gone offline.`,
      });
      if (notif) {
        this.eventsGateway.emitNotification(device.userId, notif);
      }
    }
  }
}
