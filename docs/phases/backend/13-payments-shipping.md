# Phase 13 — Payments & Shipping

## Objective

Integrate payment and shipment lifecycles without pretending external systems are perfectly reliable.

## End-to-End Work

Implement:

- Payment abstraction
- Mock payment provider
- Payment states
- Payment attempts
- Provider failure simulation
- Timeout simulation
- Webhook handling
- Webhook validation/deduplication
- Shipment creation
- Shipment state machine
- Tracking data
- Cancellation/transition rules

## Payment Reliability

Handle:

- Success
- Failure
- Timeout/unknown
- Duplicate webhook
- Webhook after API restart
- Provider event replay

## Exit Criteria

Payment and shipping states cannot be arbitrarily changed, and repeated external events do not duplicate business effects.

## Evidence

`docs/reports/03-reliability/payments.md`
Webhook tests
Provider failure tests
Shipping lifecycle tests
