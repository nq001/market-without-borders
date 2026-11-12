# ADR 001: Modular Monolith Architecture

## Status
Accepted

## Context
We are building a production-grade commerce and order management platform (Qubrax). The domains are deeply related (Cart, Inventory, Orders, Payments). There is a tendency to adopt Microservices early for modern projects, which introduces distributed transactions, network latency, and complex deployment overhead.

## Decision
We will build Qubrax as a **Modular Monolith**. The application will be deployed as a single NestJS server process backed by a single PostgreSQL instance. Internally, the code will be strictly organized into cohesive modules with explicit dependency boundaries.

## Consequences
### Positive
- Cross-domain operations (e.g., checkout) can utilize standard ACID database transactions.
- Deployment, CI/CD, and local development are drastically simplified.
- Operational overhead is low.
- We maintain the ability to carve out microservices later if scaling characteristics diverge, because the internal module boundaries are strict.

### Negative
- Scaling is coarse-grained (we scale the whole monolith).
- A memory leak or fatal crash in one module brings down the entire API instance.
- Developers must be disciplined to enforce boundaries without physical network separation.
