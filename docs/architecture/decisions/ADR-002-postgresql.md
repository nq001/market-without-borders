# ADR 002: PostgreSQL as Primary Database

## Status
Accepted

## Context
Commerce platforms require strict consistency for financial transactions, order states, and inventory levels. We need a datastore capable of enforcing constraints, preventing race conditions, and executing atomic transactions across multiple tables.

## Decision
We will use **PostgreSQL** as the sole primary database for all relational and transactional data in Qubrax. 

## Consequences
### Positive
- Strict ACID compliance guarantees financial and inventory correctness.
- Advanced constraint capabilities (`CHECK`, `UNIQUE`) allow data integrity to be enforced at the lowest level.
- Row-level locking capabilities support concurrency control strategies.

### Negative
- Schema migrations require careful planning.
- Heavy analytical queries on the primary DB could impact transactional performance (mitigated by read replicas later if needed).
