import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ICachePort } from '../common/application/cache.port';

interface MemoryCacheEntry {
  value: string;
  expiresAt: number | null;
}

@Injectable()
export class RedisService implements ICachePort, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly memoryStore = new Map<string, MemoryCacheEntry>();
  private useMemoryFallback = false;

  constructor(
    @Optional() @Inject('REDIS_CLIENT') private readonly redisClient: Redis | null,
  ) {
    if (!this.redisClient) {
      this.useMemoryFallback = true;
      this.logger.log(
        'Running with In-Memory Key-Value Store (Docker-free / Redis-free mode)',
      );
    } else {
      this.redisClient.on('error', () => {
        if (!this.useMemoryFallback) {
          this.useMemoryFallback = true;
          this.logger.warn(
            'Redis connection unavailable; falling back to in-memory TTL store',
          );
        }
      });
    }
  }

  getClient(): Redis | null {
    return this.redisClient;
  }

  isUsingMemoryFallback(): boolean {
    return this.useMemoryFallback || !this.redisClient;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.redisClient && !this.useMemoryFallback) {
      try {
        if (ttlSeconds) {
          await this.redisClient.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.redisClient.set(key, value);
        }
        return;
      } catch {
        this.useMemoryFallback = true;
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryStore.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<string | null> {
    if (this.redisClient && !this.useMemoryFallback) {
      try {
        return await this.redisClient.get(key);
      } catch {
        this.useMemoryFallback = true;
      }
    }

    const entry = this.memoryStore.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return entry.value;
  }

  async del(key: string): Promise<void> {
    if (this.redisClient && !this.useMemoryFallback) {
      try {
        await this.redisClient.del(key);
        return;
      } catch {
        this.useMemoryFallback = true;
      }
    }
    this.memoryStore.delete(key);
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
    this.memoryStore.clear();
  }
}
