import { Controller, Get, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Optional() private readonly dataSource?: DataSource,
    @Optional() private readonly redisService?: RedisService,
  ) {}

  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({
    status: 200,
    description: 'API is healthy.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        database: { type: 'string', example: 'up' },
        cache: { type: 'string', example: 'in-memory' },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-03-24T12:00:00.000Z',
        },
      },
    },
  })
  @Get()
  async check() {
    let database = 'unknown';
    if (this.dataSource?.isInitialized) {
      try {
        await this.dataSource.query('SELECT 1');
        database = 'up';
      } catch {
        database = 'down';
      }
    }

    const cache = this.redisService?.isUsingMemoryFallback()
      ? 'in-memory'
      : 'redis';

    return {
      status: database === 'down' ? 'degraded' : 'ok',
      database,
      cache,
      timestamp: new Date().toISOString(),
    };
  }
}
