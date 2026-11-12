import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../../database/entities/product.entity';
import { CategoriesModule } from '../categories/categories.module';
import { InventoryModule } from '../../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoriesModule,
    InventoryModule,
    CacheModule.registerAsync({
      useFactory: async () => {
        const redisEnabled = process.env.REDIS_ENABLED === 'true';
        if (redisEnabled && process.env.REDIS_URL) {
          try {
            return {
              store: await redisStore({
                url: process.env.REDIS_URL,
                ttl: 60000,
              }),
            };
          } catch {
            // Fall back to in-memory cache if Redis is not reachable
          }
        }
        return {
          ttl: 60000,
        };
      },
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
