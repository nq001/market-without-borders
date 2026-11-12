# ADR 003: Redis for Caching and Rate Limiting Only

## Status
Accepted

## Context
In-memory datastores are extremely fast but volatile. Commerce systems often misuse them to store critical state, leading to data loss upon failure.

## Decision
We will use **Redis** strictly for ephemeral data: caching (e.g., product catalog queries), rate limiting, and session/token blacklisting. Redis will **not** be used as the primary source of truth for carts, inventory, orders, or idempotency keys. 

## Consequences
### Positive
- The system survives a Redis cluster failure without losing financial data. Core checkout flow can fall back to the primary DB or fail open safely on rate limits.
- High performance for read-heavy operations like product catalog browsing.

### Negative
- Carts persisted to PostgreSQL incur a slightly higher latency cost than Redis-backed carts.
- Cache invalidation logic must be rigorously maintained in the application.
