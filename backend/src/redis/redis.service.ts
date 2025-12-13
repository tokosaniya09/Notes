import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.getOrThrow<string>('REDIS_URL');
    this.logger.log('Connecting to Redis...');
    
    // Upstash-compatible configuration (lazyConnect included in standard options)
    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully.');
    });

    // Explicitly connect if lazyConnect is true, though ioredis handles auto-connect on commands
    this.client.connect().catch((err) => {
        this.logger.error(`Failed to connect to Redis on startup: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis disconnected.');
  }

  getClient(): Redis {
    return this.client;
  }
}
