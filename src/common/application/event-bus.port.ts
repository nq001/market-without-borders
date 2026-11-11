import { DomainEvent } from '../domain/domain-event.base';

export const DOMAIN_EVENT_BUS_PORT = 'DOMAIN_EVENT_BUS_PORT';

export interface IDomainEventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}

