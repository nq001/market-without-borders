import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './catalog/categories/categories.module';
import { ProductsModule } from './catalog/products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { CouponsModule } from './coupons/coupons.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PaymentsModule } from './payments/payments.module';
import { ShippingModule } from './shipping/shipping.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StoresModule } from './stores/stores.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { StoreRequestsModule } from './store-requests/store-requests.module';
import { UNIT_OF_WORK_PORT } from './common/application/unit-of-work.port';
import { TypeOrmUnitOfWork } from './common/infrastructure/persistence/typeorm-unit-of-work';
import { DOMAIN_EVENT_BUS_PORT } from './common/application/event-bus.port';
import { EventEmitterDomainEventBus } from './common/infrastructure/event-bus/event-emitter-domain-event-bus';
import { User } from './database/entities/user.entity';
import { Role } from './database/entities/role.entity';
import { Permission } from './database/entities/permission.entity';
import { UserRole } from './database/entities/user-role.entity';
import { RolePermission } from './database/entities/role-permission.entity';
import { Address } from './database/entities/address.entity';
import { Category } from './database/entities/category.entity';
import { Product } from './database/entities/product.entity';
import { Inventory } from './database/entities/inventory.entity';
import { InventoryMovement } from './database/entities/inventory-movement.entity';
import { Coupon } from './database/entities/coupon.entity';
import { Cart } from './database/entities/cart.entity';
import { CartItem } from './database/entities/cart-item.entity';
import { Order } from './database/entities/order.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { OrderAddressSnapshot } from './database/entities/order-address-snapshot.entity';
import { IdempotencyKey } from './database/entities/idempotency-key.entity';
import { PaymentEvent } from './database/entities/payment-event.entity';
import { Shipment } from './database/entities/shipment.entity';
import { ShipmentEvent } from './database/entities/shipment-event.entity';
import { Notification } from './database/entities/notification.entity';
import { Review } from './database/entities/review.entity';
import { AuditLog } from './database/entities/audit-log.entity';
import { Store } from './database/entities/store.entity';
import { StoreCategory } from './database/entities/store-category.entity';
import { Complaint } from './database/entities/complaint.entity';
import { StoreEditRequest } from './database/entities/store-edit-request.entity';

const ALL_ENTITIES = [
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Address,
  Category,
  Product,
  Inventory,
  InventoryMovement,
  Coupon,
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderAddressSnapshot,
  IdempotencyKey,
  PaymentEvent,
  Shipment,
  ShipmentEvent,
  Notification,
  Review,
  AuditLog,
  Store,
  StoreCategory,
  Complaint,
  StoreEditRequest,
];

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        REDIS_ENABLED: Joi.string().default('false'),
        REDIS_URL: Joi.string().optional().allow(''),
        JWT_ACCESS_SECRET: Joi.string()
          .min(8)
          .default('dev_jwt_access_secret_key_change_in_prod'),
        JWT_REFRESH_SECRET: Joi.string()
          .min(8)
          .default('dev_jwt_refresh_secret_key_change_in_prod'),
        JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
        PAYMENT_WEBHOOK_SECRET: Joi.string().default(
          'dev_webhook_secret_key_change_in_prod',
        ),
      }),
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get<string>('NODE_ENV') === 'production';
        return {
          pinoHttp: isProd
            ? {}
            : {
                transport: {
                  target: 'pino-pretty',
                  options: { singleLine: true },
                },
              },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        entities: ALL_ENTITIES,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    RedisModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    CouponsModule,
    CartModule,
    OrdersModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PaymentsModule,
    ShippingModule,
    AuditModule,
    NotificationsModule,
    ReviewsModule,
    StoresModule,
    ComplaintsModule,
    StoreRequestsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TypeOrmUnitOfWork,
    {
      provide: UNIT_OF_WORK_PORT,
      useExisting: TypeOrmUnitOfWork,
    },
    EventEmitterDomainEventBus,
    {
      provide: DOMAIN_EVENT_BUS_PORT,
      useExisting: EventEmitterDomainEventBus,
    },
  ],
  exports: [UNIT_OF_WORK_PORT, DOMAIN_EVENT_BUS_PORT],
})
export class AppModule {}
