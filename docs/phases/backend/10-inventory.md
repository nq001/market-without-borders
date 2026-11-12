# Phase 10 — Inventory & Concurrency

## Objective

Make inventory correct under concurrent requests.

## End-to-End Work

Implement:

- Inventory records
- Inventory movements
- Adjustments
- Reservation/deduction strategy
- Release/restore behavior where required
- Concurrency control
- Auditability

## Critical Proof

If one final unit exists and two customers attempt to purchase it concurrently:

- At most one succeeds.
- Inventory never becomes negative.
- Failed operation has a deterministic error.
- Database state remains consistent.
- The behavior is observable in logs/tests.

## Strategy

Choose and document the locking/concurrency approach through an ADR.

## Tests

- Sequential purchase
- Insufficient stock
- Concurrent final-unit purchase
- Concurrent quantity updates
- Transaction rollback
- Retry behavior

## Exit Criteria

The concurrency test reliably proves the inventory invariant.

## Evidence

`docs/reports/03-reliability/concurrency.md`
Concurrency integration tests.
