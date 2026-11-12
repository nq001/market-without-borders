# Phase 02 — Requirements Engineering & Resilience Matrix

## Objective
Convert multi-store marketplace scope into verifiable functional and failure-mode specifications.

## Key Functional Requirements
- **Account Statuses:** `PENDING_APPROVAL`, `ACTIVE`, `SUSPENDED`, `REJECTED`.
- **Store Statuses:** `PENDING`, `ACTIVE`, `SUSPENDED`. Suspended stores automatically block cart additions and checkout allocations.
- **Shared Cart:** Groups items by store, computes per-store subtotals and discounts, and verifies stock availability.
- **Split Order Placement:** Atomic creation of 1 parent order record and $N$ independent store child orders within a single database transaction.
- **Complaints Tribunal:** Shoppers can file complaints against stores; Admins can resolve with automatic store suspension.

## Failure Scenarios Tested
- Concurrent checkout race for the last item (pessimistic row lock guard).
- Partial out-of-stock failure in multi-store cart (atomic rollback leaving 0 orphan records).
- Replay and double-click checkout (idempotency key cache verification).
- Cross-store unauthorized modification attempts (tenant isolation verification).
