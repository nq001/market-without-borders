# ADR 007: Idempotency Enforcement

## Status
Accepted

## Context
Network failures, client retries, and double-clicks can cause the Checkout or Payment APIs to receive the exact same payload multiple times. Processing these mutative requests twice would result in duplicate charges and oversold inventory.

## Decision
We will enforce idempotency using **PostgreSQL unique constraints**. 
Clients must provide an `Idempotency-Key` header for mutative endpoints. The application will attempt to insert this key into an `idempotency_keys(user_id, key)` table as part of the core business transaction.

## Consequences
### Positive
- If a duplicate request occurs, the unique constraint violation guarantees the transaction will fail, providing mathematical certainty against duplicate charges.
- Does not rely on Redis (which could evict keys or fail, breaking the idempotency guarantee).

### Negative
- Requires storing the API response payload alongside the idempotency key in the database if the client needs the exact same successful response returned on a retry.
- Slightly higher database write load.
