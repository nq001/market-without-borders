import { DomainEvent } from '../../../common/domain/domain-event.base';

export class OrderPlacedDomainEvent implements DomainEvent {
  readonly eventName = 'order.placed';
  readonly occurredOn = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly orderId: string,
    public readonly userId: string,
    public readonly totalAmount: number,
  ) {}
}

export class OrderPaidDomainEvent implements DomainEvent {
  readonly eventName = 'order.paid';
  readonly occurredOn = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly orderId: string,
    public readonly userId: string,
    public readonly paymentEventId?: string,
  ) {}
}

export class OrderCancelledDomainEvent implements DomainEvent {
  readonly eventName = 'order.cancelled';
  readonly occurredOn = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly orderId: string,
    public readonly userId: string,
    public readonly reason: string,
  ) {}
}
