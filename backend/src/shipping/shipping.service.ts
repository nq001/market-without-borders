import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Shipment } from '../database/entities/shipment.entity';
import { ShipmentEvent } from '../database/entities/shipment-event.entity';
import { OrdersService } from '../orders/orders.service';
import { BusinessRuleViolationException } from '../common/domain/domain-exception.base';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    private readonly dataSource: DataSource,
    @Optional()
    private readonly ordersService?: OrdersService,
    @Optional()
    private readonly eventEmitter?: EventEmitter2,
  ) {}

  @OnEvent('order.paid')
  async handleOrderPaidEvent(payload: { orderId: string }) {
    this.logger.log(`Handling order.paid event for order ${payload.orderId}`);

    await this.dataSource.transaction(async (manager) => {
      const shipment = manager.create(Shipment, {
        order_id: payload.orderId,
        status: 'PENDING',
      });
      await manager.save(shipment);

      const event = manager.create(ShipmentEvent, {
        shipment_id: shipment.id,
        status: 'PENDING',
      });
      await manager.save(event);
    });
  }

  async dispatchShipment(
    shipmentId: string,
    trackingNumber: string,
    provider: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const shipment = await manager.findOne(Shipment, {
        where: { id: shipmentId },
      });
      if (!shipment) {
        throw new BusinessRuleViolationException('Shipment not found');
      }

      if (typeof shipment.dispatch === 'function') {
        shipment.dispatch(trackingNumber, provider);
      } else {
        if (shipment.status !== 'PENDING') {
          throw new BusinessRuleViolationException(
            `Cannot dispatch shipment in status ${shipment.status}`,
          );
        }
        shipment.status = 'SHIPPED';
        shipment.tracking_number = trackingNumber;
        shipment.provider = provider;
      }

      await manager.save(shipment);

      const event = manager.create(ShipmentEvent, {
        shipment_id: shipment.id,
        status: 'SHIPPED',
      });
      await manager.save(event);

      if (this.ordersService && shipment.order_id) {
        await this.ordersService.markOrderShipped(shipment.order_id, manager);
      }

      if (this.eventEmitter) {
        this.eventEmitter.emit('shipment.dispatched', {
          shipmentId: shipment.id,
          orderId: shipment.order_id,
          trackingNumber,
          provider,
        });
      }

      return shipment;
    });
  }

  async markDelivered(shipmentId: string) {
    return this.dataSource.transaction(async (manager) => {
      const shipment = await manager.findOne(Shipment, {
        where: { id: shipmentId },
      });
      if (!shipment) {
        throw new BusinessRuleViolationException('Shipment not found');
      }

      if (typeof shipment.markDelivered === 'function') {
        shipment.markDelivered();
      } else {
        if (shipment.status !== 'SHIPPED') {
          throw new BusinessRuleViolationException(
            `Cannot deliver shipment in status ${shipment.status}`,
          );
        }
        shipment.status = 'DELIVERED';
      }

      await manager.save(shipment);

      const event = manager.create(ShipmentEvent, {
        shipment_id: shipment.id,
        status: 'DELIVERED',
      });
      await manager.save(event);

      if (this.ordersService && shipment.order_id) {
        await this.ordersService.markOrderDelivered(shipment.order_id, manager);
      }

      if (this.eventEmitter) {
        this.eventEmitter.emit('shipment.delivered', {
          shipmentId: shipment.id,
          orderId: shipment.order_id,
        });
      }

      return shipment;
    });
  }
}
