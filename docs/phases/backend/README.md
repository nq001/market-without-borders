# Backend Implementation Phases

This directory contains the 20 engineering stages for the **NestJS + TypeScript + PostgreSQL 16** backend layer of the Market Without Borders (MWB) platform.

---

## Phase Index

| Phase | Specification Document | Description |
| :--- | :--- | :--- |
| **01** | [`01-product-discovery.md`](./01-product-discovery.md) | Multi-store marketplace discovery, 3-role scope, and bounded contexts. |
| **02** | [`02-requirements.md`](./02-requirements.md) | Functional and non-functional requirements, failure modes, and acceptance criteria. |
| **03** | [`03-domain-model.md`](./03-domain-model.md) | Multi-tenant domain model, aggregates, invariants, and state machines. |
| **04** | [`04-architecture.md`](./04-architecture.md) | Hexagonal modular monolith architecture, application ports, and ADRs. |
| **05** | [`05-database.md`](./05-database.md) | PostgreSQL 16 schema design, entities, migrations, and referential constraints. |
| **06** | [`06-api-contract.md`](./06-api-contract.md) | REST API endpoints, DTO validation schemas, and OpenAPI specifications. |
| **07** | [`07-foundation.md`](./07-foundation.md) | NestJS application bootstrap, structured logging (Pino), and in-memory adapters. |
| **08** | [`08-auth-authorization.md`](./08-auth-authorization.md) | JWT authentication, user approval workflows, and RBAC guards. |
| **09** | [`09-catalog.md`](./09-catalog.md) | Product and category catalog with store association and status filtering. |
| **10** | [`10-inventory.md`](./10-inventory.md) | Real-time stock counters with pessimistic row locks (`SELECT FOR UPDATE`). |
| **11** | [`11-cart-pricing.md`](./11-cart-pricing.md) | Multi-store shared shopping cart, minor-unit money arithmetic, and coupons. |
| **12** | [`12-orders-checkout.md`](./12-orders-checkout.md) | Atomic split checkout decomposing carts into store sub-orders within 1 transaction. |
| **13** | [`13-payments-shipping.md`](./13-payments-shipping.md) | Payment gateway webhook processing, idempotency keys, and shipping milestones. |
| **14** | [`14-notifications-reviews-audit.md`](./14-notifications-reviews-audit.md) | In-app alerts, verified reviews, and platform-wide immutable audit logging. |
| **15** | [`15-comprehensive-testing.md`](./15-comprehensive-testing.md) | Unit, controller, integration, and E2E resilience test suites (Jest + Supertest). |
| **16** | [`16-docker-local-production-parity.md`](./16-docker-local-production-parity.md) | Containerization with local/production environment parity. |
| **17** | [`17-ci-cd.md`](./17-ci-cd.md) | Automated CI/CD pipelines, linting, testing, and security scanning. |
| **18** | [`18-production-deployment.md`](./18-production-deployment.md) | Production release procedures, zero-downtime migrations, and health probes. |
| **19** | [`19-observability-performance-failure.md`](./19-observability-performance-failure.md) | Telemetry metrics, slow query profiling, and chaos failure injection. |
| **20** | [`20-documentation-launch-qubrax-real.md`](./20-documentation-launch-qubrax-real.md) | Complete engineering documentation package, handoff, and launch readiness. |
