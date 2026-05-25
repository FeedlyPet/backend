import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    try {
      this.client = new Redis({ host, port, lazyConnect: true });
      this.client.connect().catch((err: unknown) => {
        this.logger.warn(`Redis connection failed: ${String(err)}`);
      });
    } catch (err: unknown) {
      this.logger.warn(`Redis init failed: ${String(err)}`);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  /**
   * Acquire a distributed lock using SET NX PX.
   * Returns true if the lock was acquired (or Redis is unavailable — fail-open).
   */
  async acquireLock(key: string, ttlMs: number): Promise<boolean> {
    if (!this.client) {
      return true; // fail-open: no Redis, allow processing
    }

    try {
      const result = await this.client.set(key, '1', 'PX', ttlMs, 'NX');
      return result === 'OK';
    } catch (err: unknown) {
      this.logger.warn(`Lock acquire error for ${key}: ${String(err)}`);
      return true; // fail-open
    }
  }
}
