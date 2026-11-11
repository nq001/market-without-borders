import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { OrderAddressSnapshot } from '../database/entities/order-address-snapshot.entity';
import { IdempotencyKey } from '../database/entities/idempotency-key.entity';
import { CartModule } from '../cart/cart.module';
import { InventoryModule } from '../inventory/inventory.module';
import { CouponsModule } from '../coupons/coupons.module';
import { VERIFIED_PURCHASE_PORT } from './application/ports/verified-purchase.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderAddressSnapshot,
      IdempotencyKey,
    ]),
    CartModule,
    InventoryModule,
    CouponsModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: VERIFIED_PURCHASE_PORT,
      useExisting: OrdersService,
    },
  ],
  exports: [OrdersService, VERIFIED_PURCHASE_PORT],
})
export class OrdersModule {}
