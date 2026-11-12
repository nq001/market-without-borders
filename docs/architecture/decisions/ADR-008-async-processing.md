# ADR 008: Asynchronous Processing

## Status
Accepted

## Context
Certain operations—like sending order confirmation emails, processing webhooks, or generating audit logs—should not block the main API HTTP response. Synchronous execution of these tasks increases latency and reduces the availability of the API if the email provider goes down.

## Decision
We will use an **Internal Event Emitter** (e.g., `@nestjs/event-emitter`) for simple, non-critical asynchronous tasks within the Monolith.
For critical tasks requiring guaranteed delivery and retries (e.g., external Webhook processing), we will implement an **Outbox Pattern** backed by PostgreSQL, or use a reliable job queue like BullMQ (backed by Redis) if the volume demands it. Initially, we will rely on internal events and PostgreSQL state for simplicity.

## Consequences
### Positive
- HTTP endpoints remain fast.
- The core checkout flow is decoupled from the notification systems.

### Negative
- Debugging asynchronous events is more difficult than tracing synchronous execution.
- Without a robust Outbox implementation, an API crash immediately after a DB commit could result in lost in-memory events.
