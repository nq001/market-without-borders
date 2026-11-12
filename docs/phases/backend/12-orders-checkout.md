# Phase 12 — Atomic Multi-Store Split Orders & Checkout Reliability

## Objective
Build a fault-tolerant checkout pipeline that decomposes multi-store composite carts into independent store sub-orders within a single atomic database transaction.

## The Atomic Split Checkout Workflow
1. Authenticate user and validate cart contents across all participating stores.
2. Verify that none of the stores are currently `SUSPENDED`.
3. Check `x-idempotency-key` against database cache. If already processed, replay the cached response immediately.
4. Acquire pessimistic row-level locks (`SELECT ... FOR UPDATE`) on all inventory rows across all stores.
5. If any single product lacks stock, trigger an **atomic rollback of the entire checkout transaction**, leaving zero orphan records in the database.
6. Insert parent composite order and $N$ independent store sub-orders.
7. Return deterministic receipt summary for customer review and confirmation.
