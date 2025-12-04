import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
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
  ConfigCommandPayload,
  DeviceStatusPayload,
  FeedingEventPayload,
  FoodLevelPayload,
  DeviceErrorPayload,
} from './dto';

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
  ) {}

  async onModuleInit() {
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

    this.client.on('message', async (topic, message) => {
      try {
        await this.handleMessage(topic, message.toString());
      } catch (error) {
        this.logger.error(`Error processing message on topic ${topic}`, error);
      }
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

    let payload: any;
    try {
      payload = JSON.parse(message);
    } catch {
      this.logger.warn(`Invalid JSON message on topic ${topic}`);
      return;
    }

    if (category === 'status' && action === 'online') {
      await this.handleDeviceStatus(deviceId, payload);
    } else if (category === 'status' && action === 'food') {
      await this.handleFoodLevel(deviceId, payload);
    } else if (category === 'event' && action === 'feeding') {
      await this.handleFeedingEvent(deviceId, payload);
    } else if (category === 'error') {
      await this.handleDeviceError(deviceId, payload);
    }
  }

  private async handleDeviceStatus(hardwareId: string, payload: DeviceStatusPayload) {
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

    this.logger.log(`Device ${hardwareId} status updated: ${payload.online ? 'online' : 'offline'}`);

    if (payload.foodLevel !== undefined) {
      await this.saveFoodLevel(device.id, payload.foodLevel);
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

  private async handleFeedingEvent(hardwareId: string, payload: FeedingEventPayload) {
    const device = await this.devicesRepository.findOne({
      where: { deviceId: hardwareId },
    });

    if (!device) {
      this.logger.warn(`Unknown device: ${hardwareId}`);
      return;
    }

    let scheduleId: string | null = null;
    if (payload.scheduleId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(payload.scheduleId)) {
        const schedule = await this.schedulesRepository.findOne({
          where: { id: payload.scheduleId },
        });

        if (schedule) {
          scheduleId = payload.scheduleId;
        } else {
          this.logger.warn(`Schedule not found for device ${hardwareId}: ${payload.scheduleId}`);
        }
      } else {
        this.logger.warn(`Invalid scheduleId format from device ${hardwareId}: ${payload.scheduleId}`);
      }
    }

    const feedingEvent = this.feedingEventsRepository.create({
      deviceId: device.id,
      petId: device.petId,
      scheduleId,
      portionSize: payload.portionSize,
      type: payload.type === 'automatic' ? FeedingType.AUTOMATIC : FeedingType.MANUAL,
      success: payload.success,
      errorMessage: payload.errorMessage || null,
      timestamp: new Date(payload.timestamp),
    });

    await this.feedingEventsRepository.save(feedingEvent);
    this.logger.log(`Feeding event recorded for device ${hardwareId}: ${payload.portionSize}g`);
  }

  private async handleDeviceError(hardwareId: string, payload: DeviceErrorPayload) {
    this.logger.error(
      `Device error from ${hardwareId}: [${payload.errorCode}] ${payload.errorMessage}`,
    );
  }

  async sendFeedCommand(hardwareId: string, portionSize: number, scheduleId?: string): Promise<boolean> {
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
      this.client!.publish(topic, JSON.stringify(payload), { qos: 1 }, (error) => {
        if (error) {
          this.logger.error(`Failed to send feed command to ${hardwareId}`, error);
          resolve(false);
        } else {
          this.logger.log(`Feed command sent to ${hardwareId}: ${portionSize}g`);
          resolve(true);
        }
      });
    });
  }

  async sendConfigCommand(hardwareId: string, config: ConfigCommandPayload): Promise<boolean> {
    if (!this.client || !this.client.connected) {
      this.logger.warn('MQTT client not connected');
      return false;
    }

    const topic = `${this.topicPrefix}/${hardwareId}/command/config`;

    return new Promise((resolve) => {
      this.client!.publish(topic, JSON.stringify(config), { qos: 1 }, (error) => {
        if (error) {
          this.logger.error(`Failed to send config to ${hardwareId}`, error);
          resolve(false);
        } else {
          this.logger.log(`Config sent to ${hardwareId}`);
          resolve(true);
        }
      });
    });
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}