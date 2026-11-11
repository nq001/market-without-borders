import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '../database/entities/shipment.entity';
import { ShipmentEvent } from '../database/entities/shipment-event.entity';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, ShipmentEvent]),
    OrdersModule,
  ],
  providers: [ShippingService],
  controllers: [ShippingController],
  exports: [ShippingService],
})
export class ShippingModule {}
