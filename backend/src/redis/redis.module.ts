import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { CACHE_PORT } from '../common/application/cache.port';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService): Redis | null => {
        const redisEnabled = configService.get<string>('REDIS_ENABLED', 'false');
        const url = configService.get<string>('REDIS_URL');
        if (redisEnabled === 'false' || redisEnabled === '0' || !url) {
          return null;
        }
        const client = new Redis(url, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          retryStrategy: (times) => {
            if (times > 2) {
              return null; // Stop retrying and let RedisService use in-memory fallback
            }
            return Math.min(times * 50, 500);
          },
        });
        client.on('error', () => {
          // Handled gracefully by RedisService memory fallback
        });
        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
    {
      provide: CACHE_PORT,
      useExisting: RedisService,
    },
  ],
  exports: ['REDIS_CLIENT', RedisService, CACHE_PORT],
})
export class RedisModule {}
