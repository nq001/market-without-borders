import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { Coupon } from '../database/entities/coupon.entity';
import { COUPON_PORT } from './application/ports/coupon.port';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon])],
  controllers: [CouponsController],
  providers: [
    CouponsService,
    {
      provide: COUPON_PORT,
      useExisting: CouponsService,
    },
  ],
  exports: [CouponsService, COUPON_PORT],
})
export class CouponsModule {}
