# Market Without Borders (MWB)
## Enterprise Multi-Store Artisan Marketplace & Distributed Order Management Platform (DOMP)

> **Build less. Understand more. Ship seriously. Measure everything.**

**Project:** Market Without Borders (MWB) - Multi-Store Commerce & Order Management Platform  
**Type:** Production-oriented Multi-Tenant E-commerce & Order Management Platform (Full-Stack)  
**Primary Stack:** NestJS + TypeScript + React 19 + Vite + TailwindCSS + PostgreSQL + Redis/In-Memory + Docker  
**Testing:** Jest (Unit/Controller & E2E) + Supertest + Vitest  
**API Documentation:** OpenAPI / Swagger  
**Deployment:** Docker + CI/CD + Cloud  
**Architecture:** Clean / Hexagonal Modular Monolith with Multi-Tenant Store Workspaces & Atomic Split Ordering  
**Status:** Fully Implemented, Verified, and Tested (100% Passing Benchmark)

---

# 1. Executive Summary

This project is a production-grade multi-tenant artisan marketplace and distributed order management platform designed to demonstrate modern software engineering, clean hexagonal domain boundaries, and bulletproof transactional resilience.

The platform manages:

- Multi-tenant **Stores** (Active, Suspended, Pending) with isolated artisan branding & categories
- Multi-role **Users** (Super Admin, Store Owner / Staff, Customer) with Approval workflows
- **Three-Tier Role-Based Workspaces**:
  - **Super Admin Console**: 14 grouped sections (Overview, Management, Moderation, Business, System)
  - **Store Owner / Staff Workspace**: 11 dedicated sections (Products, Stock, Orders, Coupons, Reviews, Staff RBAC, Earnings)
  - **Customer Storefront Experience**: Category browsing, unified multi-store cart, split checkout, receipts, complaints, and favourites
- **Store Edit Requests**: Side-by-side JSON comparison of requested store updates with approve/reject reasons
- **Customer Complaints Tribunal**: Supervised dispute escalation with direct store suspension hooks
- Products with Category and Store linkages
- Inventory with row-level pessimistic locking (`SELECT FOR UPDATE`) preventing race overdrafts
- Shared Multi-Store Carts with store grouping and per-store subtotals
- Orders & Checkout with atomic decomposition into store sub-orders and rollback guarantees
- Payments with webhook verification and TTL reservation compensation
- Shipping with strict milestone progression (`PENDING` → `PREPARING` → `SHIPPED` → `DELIVERED`)
- Store-specific and Platform-wide Coupons
- In-App Notifications and Email Dispatch adapters
- Product and Store Reviews with merchant replies and moderation flags
- Platform-wide Activity & Audit Logs recording actor ID, store ID, IP address, and JSON diffs
- Internationalization (i18n): English & Arabic with dynamic Right-to-Left (`dir="rtl"`) layout
- Health and operational telemetry endpoints

The difficult part is not creating endpoints. The difficult part is maintaining **correctness, security, multi-tenant isolation, consistency, reliability, and observability** when requests are duplicated, concurrent, retried, delayed, or split across independent merchant pipelines.

The project must therefore demonstrate:

```text
Problem
  ↓
Requirements
  ↓
Domain Modeling
  ↓
Architecture
  ↓
Database Design
  ↓
API Design
  ↓
Security
  ↓
Implementation
  ↓
Testing
  ↓
Containerization
  ↓
CI/CD
  ↓
Deployment
  ↓
Observability
  ↓
Performance
  ↓
Failure Testing
  ↓
Documentation
  ↓
Public Launch
```

---

# 2. Golden Engineering Rule

> **Do not use a technology because you can use it. Use it because the problem requires it.**

Every important technical decision must answer:

1. Why did we choose this?
2. What problem does it solve?
3. What alternatives did we consider?
4. What are the trade-offs?
5. When does this solution become inappropriate?

This applies to:

- PostgreSQL
- Redis
- ORM
- Transactions
- Locking strategy
- JWT / refresh tokens
- RBAC
- Caching
- Queues
- Idempotency
- Docker
- CI/CD
- Cloud infrastructure
- Monitoring

---

# 3. Product Vision

Build an enterprise multi-store artisan marketplace and distributed order management platform that can safely govern the complete customer, merchant, and administrator journey:

```text
Browse Independent Stores & Categories
   ↓
Discover Artisan Handcrafted Products
   ↓
Add to Shared Multi-Store Cart (Grouped by Store)
   ↓
Apply Store-Specific or Platform-Wide Coupons
   ↓
Atomic Multi-Store Checkout (Review Composite Receipt)
   ↓
Split into Independent Store Sub-Orders (Within 1 Transaction)
   ↓
Payment Capture & Pessimistic Row Lock Reservation
   ↓
Store Owner Prepares Order (or Rejects with Reason)
   ↓
Shipment Dispatched with Tracking Carrier
   ↓
Proof of Delivery Confirmed
   ↓
Customer Review / Dispute & Complaint Tribunal
```

The system must remain correct even when:

- the customer double-clicks Checkout across multiple stores;
- a request is retried with duplicate `x-idempotency-key`;
- 10 customers purchase the last remaining item concurrently (pessimistic lock race);
- one store has stock but another store in the shared cart is sold out (atomic rollback of entire checkout);
- a customer attempts to add an item from a `SUSPENDED` store (interception & clean rejection);
- an owner tries to modify another owner's catalog items (strict tenant isolation);
- an owner resubmits a store edit request before it has been reviewed or rejected (FSM guard);
- payment times out or fails (automatic inventory reservation release via TTL);
- an external payment gateway sends duplicate webhooks;
- an admin resolves a customer complaint with `STORE_SUSPENDED` (atomic cascade to store and product checkout availability).

---

# 4. Problem Statement

A commerce company needs a backend that manages products, customers, inventory, orders, payments, shipping, and access control.

A naive implementation can produce:

- duplicate orders;
- overselling;
- incorrect totals;
- stale product prices;
- invalid coupon usage;
- inconsistent payment status;
- unauthorized administrative operations;
- lost notifications;
- duplicated webhook processing;
- corrupted state after retries;
- difficult-to-debug production failures.

The project solves these problems through deliberate domain modeling, database constraints, transactions, idempotency, concurrency control, authorization, testing, and observability.

---

# 5. Goals

## 5.1 Primary Goals

- Build a production-oriented NestJS backend.
- Model commerce domains correctly.
- Maintain financial and inventory consistency.
- Prevent duplicate operations.
- Handle concurrent purchases safely.
- Implement authentication and authorization.
- Provide a documented REST API.
- Build comprehensive automated tests.
- Containerize the system.
- Establish CI/CD.
- Deploy to production.
- Monitor the system.
- Measure performance.
- Document engineering decisions.

## 5.2 Non-Goals

The first version does not attempt to build:

- a full frontend;
- a real warehouse management system;
- a full accounting platform;
- a recommendation engine;
- a multi-region distributed architecture;
- microservices without a demonstrated need.

---

# 6. Users

## 6.1 Customer

Capabilities:

- Register
- Login
- Refresh session
- Manage profile
- Manage addresses
- Browse products
- Search products
- View product details
- Manage cart
- Apply coupons
- Checkout
- Pay
- View orders
- Track shipment
- Cancel eligible orders
- Create reviews

## 6.2 Admin

Capabilities:

- Manage products
- Manage categories
- Manage inventory
- Manage orders
- Manage users
- Manage roles
- Manage coupons
- View reports
- View audit logs

## 6.3 Staff

Staff access is permission-based.

Examples:

```text
inventory.read
inventory.update
orders.read
orders.update
products.read
products.update
shipping.update
```

Staff must not automatically receive administrative access.

---

# 7. Functional Requirements

## 7.1 Authentication

- User registration
- Login
- Password hashing
- Access token
- Refresh token
- Logout / token revocation strategy
- Password change
- Account status checks

## 7.2 Users

- Get profile
- Update profile
- Manage addresses
- Admin user management

## 7.3 Roles & Permissions

- Create roles
- Assign permissions
- Assign roles
- Check permissions
- Protect endpoints
- Enforce resource ownership

## 7.4 Products

- Create
- Read
- Update
- Archive
- Search
- Filter
- Pagination
- Product detail
- Category assignment

## 7.5 Categories

- Create
- Update
- List
- Archive
- Product association

## 7.6 Inventory

- Track stock
- Adjust stock
- Reserve stock
- Release stock
- Deduct stock
- Prevent negative inventory
- Record inventory movements

## 7.7 Cart

- Create/get cart
- Add item
- Update quantity
- Remove item
- Clear cart
- Calculate subtotal
- Validate cart during checkout

## 7.8 Orders

- Create through checkout
- List customer orders
- Get order
- Admin order management
- Cancel where allowed
- State transition validation

## 7.9 Payments

- Create payment attempt
- Track payment status
- Handle success/failure
- Handle provider webhook
- Prevent duplicate webhook processing
- Support reconciliation

## 7.10 Shipping

- Create shipment
- Assign tracking number
- Update shipment state
- Track shipment

## 7.11 Coupons

- Create coupon
- Activate/deactivate
- Expiration
- Usage limits
- Minimum order value
- Percentage/fixed discount
- Customer eligibility
- Prevent invalid reuse

## 7.12 Notifications

- Order notifications
- Payment notifications
- Shipping notifications
- Account notifications
- Delivery mechanism abstraction

## 7.13 Reviews

- Create review
- Update/delete own review
- Admin moderation
- Optional verified-purchase rule

## 7.14 Audit Logs

Record sensitive operations:

- Login failures
- Role changes
- Product changes
- Inventory changes
- Order status changes
- Refunds
- Coupon changes
- Administrative actions

## 7.15 Health

Provide operational checks for:

- API
- PostgreSQL
- Redis
- Optional external dependencies

---

# 8. Non-Functional Requirements

## Performance

Target baselines should be defined after deployment rather than guessed.

Measure:

- P50 latency
- P95 latency
- P99 latency
- throughput
- database latency
- slow queries
- error rate

## Availability

The application should fail gracefully when non-critical dependencies are unavailable.

## Security

- Strong password hashing
- Authentication
- Authorization
- Input validation
- Rate limiting
- Secure headers
- CORS policy
- Secrets management
- Ownership checks
- ORM/parameterized queries
- Audit logging
- Mass-assignment protection

## Reliability

- Idempotency
- Transactions
- Database constraints
- Concurrency control
- Retry-safe operations
- Timeout handling
- Webhook deduplication
- Recovery/reconciliation

## Maintainability

- Modular architecture
- Clear domain boundaries
- DTO validation
- Service boundaries
- Consistent error handling
- Automated tests
- Documentation

---

# 9. Architecture

## 9.1 Initial Architecture

Use a **Modular Monolith**.

```text
                        Client
                          |
                          v
                Reverse Proxy / LB
                          |
                          v
                 NestJS API Server
                          |
        +-----------------+------------------+
        |                 |                  |
        v                 v                  v
     Modules          PostgreSQL           Redis
        |
        +-- Auth
        +-- Users
        +-- Roles
        +-- Products
        +-- Categories
        +-- Inventory
        +-- Cart
        +-- Orders
        +-- Payments
        +-- Shipping
        +-- Coupons
        +-- Notifications
        +-- Reviews
        +-- Audit
        +-- Health
```

## 9.2 Why Modular Monolith?

### Why?

The domains are related and initially share:

- one database;
- transactions;
- deployment lifecycle;
- operational ownership.

### Problem solved

It provides strong module boundaries without introducing distributed-system complexity too early.

### Alternatives

- Microservices
- Serverless
- Event-driven distributed architecture

### Trade-offs

Advantages:

- simpler deployment;
- easier transactions;
- lower operational cost;
- easier local development;
- faster development.

Disadvantages:

- application scaling is initially coarse-grained;
- modules share runtime resources;
- bad boundaries can create coupling.

### When it becomes insufficient

Consider extracting a service when:

- a domain has clearly different scaling requirements;
- independent deployment is valuable;
- team ownership requires separation;
- workload isolation is necessary;
- failure isolation justifies the complexity.

Do not split services merely to make the architecture look advanced.

---

# 10. Module Boundaries

Each NestJS module should own its domain behavior.

Example:

```text
src/
├── auth/
├── users/
├── roles/
├── products/
├── categories/
├── inventory/
├── cart/
├── orders/
├── payments/
├── shipping/
├── coupons/
├── notifications/
├── reviews/
├── audit/
├── health/
├── common/
└── database/
```

Avoid allowing controllers to directly manipulate unrelated domain data.

---

# 11. Domain Model

```text
User
 ├── Role
 └── Address

Product
 ├── Category
 ├── Inventory
 └── Review

Cart
 └── CartItem
       └── Product

Order
 ├── OrderItem
 ├── Payment
 ├── Shipment
 └── AddressSnapshot

Coupon

AuditLog

Notification
```

---

# 12. Critical Data Modeling Rule

When an order is created, save historical snapshots.

An order must not depend on mutable current values.

## Product Snapshot

An `OrderItem` should store at least:

```text
product_id
product_name_snapshot
sku_snapshot
unit_price
quantity
discount_amount
tax_amount (if applicable)
line_total
```

## Address Snapshot

The order should store:

```text
full_name
phone
country
city
state
street
postal_code
additional_details
```

Why?

If the customer later changes:

- product price;
- product name;
- product SKU;
- address;

the historical order must remain unchanged.

---

# 13. Database

## 13.1 Why PostgreSQL?

PostgreSQL is the default database because the core domain requires:

- relational consistency;
- foreign keys;
- transactions;
- unique constraints;
- check constraints;
- indexes;
- reliable financial/inventory state.

### Alternatives

- MySQL
- MongoDB
- DynamoDB

### Trade-off

PostgreSQL provides strong relational guarantees but requires deliberate schema and query design.

### When it may be inappropriate

A different datastore may be justified for a specific workload, such as:

- massive analytical workloads;
- specialized search;
- high-volume event storage.

Do not replace PostgreSQL merely because another database is fashionable.

---

# 14. Core Tables

Recommended entities:

```text
users
roles
permissions
user_roles
role_permissions
addresses

categories
products
product_categories

inventories
inventory_movements

carts
cart_items

orders
order_items
order_address_snapshots
order_status_history

payments
payment_events

shipments
shipment_events

coupons
coupon_usages

notifications

reviews

audit_logs

idempotency_keys
```

Additional tables may be introduced when a demonstrated requirement requires them.

---

# 15. Important Database Constraints

Examples:

```text
users.email UNIQUE

products.sku UNIQUE

inventory.product_id UNIQUE

cart_items(cart_id, product_id) UNIQUE

coupon.code UNIQUE

idempotency_keys(user_id, key) UNIQUE

payment_events(provider_event_id) UNIQUE
```

Inventory should never allow:

```text
stock < 0
```

Use a database-level constraint where appropriate.

Application checks alone are not enough.

---

# 16. Indexing Strategy

Indexes must be driven by actual query patterns.

Likely candidates:

```text
users(email)

products(sku)
products(category_id)
products(status)
products(created_at)

orders(customer_id, created_at)
orders(status, created_at)

order_items(order_id)

inventory(product_id)

reviews(product_id)

notifications(user_id, created_at)

audit_logs(actor_id, created_at)
audit_logs(action, created_at)
```

Do not add indexes blindly.

Every index has a cost:

- storage;
- write overhead;
- maintenance;
- memory usage.

Use query plans to validate important indexes.

---

# 17. Money Representation

Never use floating-point values for monetary calculations.

Prefer:

- PostgreSQL `NUMERIC`;
- or integer minor units such as cents/halalas.

Choose one representation and apply it consistently.

Example:

```text
100.50 SAR
```

could be represented as:

```text
10050 minor units
```

The domain must define currency explicitly.

---

# 18. Order State Machine

Primary flow:

```text
PENDING
   ↓
CONFIRMED
   ↓
PAID
   ↓
PROCESSING
   ↓
SHIPPED
   ↓
DELIVERED
```

Other states:

```text
PAYMENT_FAILED
CANCELLED
REFUNDED
```

Do not allow arbitrary status updates.

## Transition Rules

Example:

```text
PENDING → CONFIRMED       ✓
CONFIRMED → PAID          ✓
PAID → PROCESSING         ✓
PROCESSING → SHIPPED      ✓
SHIPPED → DELIVERED       ✓

DELIVERED → PENDING       ✗
DELIVERED → CONFIRMED     ✗
```

Implement transitions through a domain policy/service rather than allowing:

```http
PATCH /orders/:id
{
  "status": "DELIVERED"
}
```

without validation.

---

# 19. Checkout Design

Checkout is the most important workflow.

Conceptually:

```text
Validate Cart
    ↓
Validate Product State
    ↓
Validate Prices
    ↓
Validate Coupon
    ↓
Check/Reserve Inventory
    ↓
Create Order
    ↓
Create Order Items
    ↓
Create Payment Attempt
    ↓
Clear/Finalize Cart
    ↓
Commit
```

The exact sequence depends on the selected payment architecture.

The implementation must explicitly define what is inside the database transaction and what is outside it.

---

# 20. Transactions

Use database transactions for operations that require atomicity.

Examples:

- checkout database state;
- inventory adjustment;
- order creation;
- order status changes;
- coupon usage updates.

Do not hold a database transaction open while waiting for a slow external payment provider.

## Key Principle

Database transactions provide atomicity inside the database.

They do **not** magically make external APIs transactional.

---

# 21. Concurrency Control

## Problem

Two users attempt to buy the last unit:

```text
Stock = 1

User A → sees 1
User B → sees 1

A → buys
B → buys
```

Naive read-then-write logic can oversell.

## Possible Strategies

### Pessimistic locking

Lock the inventory row during the critical transaction.

### Atomic conditional update

Example concept:

```sql
UPDATE inventories
SET available_quantity = available_quantity - 1
WHERE product_id = $1
  AND available_quantity >= 1;
```

Then verify affected rows.

### Optimistic concurrency

Use a version column and reject stale updates.

The project should choose the strategy based on workload and explain the decision.

---

# 22. Idempotency

Checkout must support idempotency.

Client sends:

```http
Idempotency-Key: 7f9c...
```

The server stores the result associated with the key.

Conceptually:

```text
Request A
   ↓
Create order
   ↓
Store result

Request B with same key
   ↓
Return previous result
```

Requirements:

- key must be scoped correctly;
- concurrent duplicate requests must be safe;
- the key/result storage must be durable enough for the required guarantee;
- conflicting reuse must be rejected.

Idempotency must not rely only on Redis if losing Redis could create duplicate financial operations.

---

# 23. Payment Design

Use a provider abstraction.

```text
PaymentService
      |
      +-- PaymentProvider
              |
              +-- MockProvider
              +-- RealProvider
```

The first implementation can use a mock provider for development/testing.

A real provider can later implement the same interface.

## Payment states

Example:

```text
PENDING
AUTHORIZED
SUCCEEDED
FAILED
REFUNDED
```

Payment state must not be inferred solely from the client.

---

# 24. Webhook Reliability

Payment providers may send the same webhook multiple times.

Therefore:

```text
Webhook
   ↓
Validate signature
   ↓
Check event ID
   ↓
If already processed → return success
   ↓
Process event
   ↓
Record event ID
```

Use a unique constraint on provider event IDs.

---

# 25. Payment Timeout Scenario

Example:

```text
API → Payment Provider
              |
              X timeout
```

Do not assume:

```text
timeout = payment failed
```

The provider may have successfully processed the payment while the response was lost.

Correct strategy may involve:

- provider lookup;
- webhook;
- reconciliation job;
- explicit uncertain/pending state.

The project must document the selected behavior.

---

# 26. Redis

Redis should only be introduced when it solves a demonstrated problem.

Valid uses:

- catalog caching;
- rate limiting;
- temporary state;
- distributed coordination where justified;
- short-lived data.

Redis must not become the source of truth for:

- orders;
- payments;
- financial balances;
- inventory truth.

## Failure Rule

If Redis goes down, core correctness should survive wherever reasonably possible.

---

# 27. Caching Strategy

Potential flow:

```text
GET Product
    ↓
Redis
    ↓ hit
Return cached data

    ↓ miss
PostgreSQL
    ↓
Store in Redis
    ↓
Return
```

Define:

- TTL;
- cache key format;
- invalidation rules;
- stale data tolerance;
- failure behavior.

Cache invalidation is part of the design, not an afterthought.

---

# 28. Authentication

Recommended model:

```text
Register
   ↓
Hash password
   ↓
Store user
```

Login:

```text
Credentials
   ↓
Verify password
   ↓
Issue access token
   ↓
Issue refresh token
```

Refresh tokens should have:

- expiration;
- revocation strategy;
- secure storage approach;
- rotation strategy where appropriate.

Never store plaintext passwords.

Never log tokens.

---

# 29. Authorization

Use layered authorization:

```text
Authentication
      ↓
Role/Permission
      ↓
Resource Ownership
      ↓
Business Rule
```

Example:

A customer may access an order only if:

```text
order.customer_id == authenticated_user.id
```

Admin access must be separately authorized.

Never rely on frontend restrictions for security.

---

# 30. Mass Assignment Protection

Do not blindly spread request objects into entities.

Bad:

```text
entity = {
  ...request.body
}
```

A malicious user might attempt:

```text
{
  "role": "ADMIN",
  "is_verified": true
}
```

Use explicit DTOs and allowed fields.

---

# 31. Validation

Validate:

- body;
- params;
- query;
- pagination;
- enum values;
- UUIDs/IDs;
- quantities;
- prices;
- coupon inputs.

Reject unexpected fields where appropriate.

Use consistent validation errors.

---

# 32. Rate Limiting

Apply stronger limits to sensitive endpoints:

- login;
- registration;
- password operations;
- checkout;
- payment endpoints;
- webhooks where appropriate.

Redis can be used for distributed rate limiting when the application runs across multiple instances.

---

# 33. CORS and Security Headers

Define CORS explicitly.

Do not use permissive production defaults without understanding them.

Use secure headers appropriate to the deployment.

Production secrets must not be committed to Git.

---

# 34. Error Handling

Create consistent API errors.

Example:

```json
{
  "statusCode": 409,
  "code": "INVENTORY_CONFLICT",
  "message": "Product is no longer available",
  "requestId": "..."
}
```

Use stable machine-readable error codes.

Avoid leaking:

- stack traces;
- database internals;
- secrets;
- sensitive provider responses.

---

# 35. API Design

Use REST conventions.

Example:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh

GET    /products
GET    /products/:id
POST   /products
PATCH  /products/:id

GET    /categories
POST   /categories

GET    /cart
POST   /cart/items
PATCH  /cart/items/:id
DELETE /cart/items/:id

POST   /checkout

GET    /orders
GET    /orders/:id
POST   /orders/:id/cancel

GET    /payments/:id

GET    /shipments/:id

POST   /reviews
PATCH  /reviews/:id
DELETE /reviews/:id

GET    /health
```

Sensitive operations should use explicit commands/actions where that improves correctness.

---

# 36. API Versioning

Use an explicit versioning strategy.

Example:

```text
/api/v1/products
/api/v1/orders
```

Do not introduce breaking API changes without a migration strategy.

---

# 37. Pagination

Use pagination for potentially large collections.

Possible approach:

```text
limit
cursor
```

Cursor pagination is preferred for large/high-change datasets when appropriate.

Document the chosen approach.

---

# 38. API Documentation

Swagger/OpenAPI must document:

- endpoints;
- request schemas;
- response schemas;
- authentication;
- error responses;
- pagination;
- examples.

Swagger is not a substitute for good API design.

---

# 39. Testing Strategy

Testing pyramid:

```text
             E2E
            /   \
      Integration
         /       \
       Unit Tests
```

## Unit Tests

Test pure business rules:

- pricing;
- coupon rules;
- inventory rules;
- order transitions;
- permission policies.

## Integration Tests

Test:

- repositories;
- PostgreSQL;
- constraints;
- transactions;
- locking/concurrency;
- authentication flows;
- payment integration boundaries.

## E2E Tests

Critical journey:

```text
Register
   ↓
Login
   ↓
Browse
   ↓
Add to Cart
   ↓
Checkout
   ↓
Payment
   ↓
Order Tracking
```

---

# 40. Critical Reliability Tests

The test suite must include scenarios for:

## Duplicate checkout

Two requests with the same idempotency key must not create two orders.

## Concurrent purchase

Two buyers competing for one unit must not create negative stock or two successful purchases.

## Duplicate webhook

Same payment event twice must be processed once.

## Payment timeout

The system must not incorrectly mark uncertain payments as failed.

## Unauthorized access

Customer A cannot access Customer B's order.

## Invalid state transition

Delivered order cannot return to pending.

## Transaction rollback

If a critical database operation fails, partial checkout state must not remain.

---

# 41. Database Integration Testing

Use an isolated test database.

Test real database behavior for:

- constraints;
- transactions;
- unique indexes;
- foreign keys;
- row locking;
- concurrent updates.

Mocking PostgreSQL cannot prove database concurrency behavior.

---

# 42. E2E Environment

Use Docker Compose for repeatable test infrastructure.

Example:

```text
docker-compose.test.yml

PostgreSQL
Redis
API
```

Run migrations before tests.

Seed only deterministic test data.

---

# 43. Project Structure

Recommended structure:

```text
commerce-platform/
├── src/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── products/
│   ├── categories/
│   ├── inventory/
│   ├── cart/
│   ├── orders/
│   ├── payments/
│   ├── shipping/
│   ├── coupons/
│   ├── notifications/
│   ├── reviews/
│   ├── audit/
│   ├── health/
│   ├── common/
│   ├── database/
│   ├── app.module.ts
│   └── main.ts
│
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── security.md
│   ├── reliability.md
│   ├── observability.md
│   ├── decisions/
│   └── case-study.md
│
├── docker/
├── .github/
│   └── workflows/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

If TypeORM is selected instead of Prisma, replace the persistence layer accordingly. The architectural principles remain the same.

---

# 44. Configuration

Use environment variables for deployment-specific configuration.

Example:

```text
NODE_ENV
PORT

DATABASE_URL

REDIS_URL

JWT_ACCESS_SECRET
JWT_REFRESH_SECRET

PAYMENT_PROVIDER_KEY
PAYMENT_WEBHOOK_SECRET

CORS_ORIGIN
```

Provide:

```text
.env.example
```

Never commit real secrets.

---

# 45. Docker

Development architecture:

```text
Docker Compose
├── API
├── PostgreSQL
└── Redis
```

The API image should:

- use a production-capable Node image;
- install deterministic dependencies;
- build TypeScript;
- run as a non-root user where practical;
- expose only required ports;
- use environment configuration.

---

# 46. Docker Compose

Development Compose should provide:

- API;
- PostgreSQL;
- Redis;
- persistent database volume;
- health checks;
- environment configuration.

Production deployment should not blindly reuse a development Compose file.

---

# 47. Health Checks

Example endpoints:

```text
GET /health
GET /health/live
GET /health/ready
```

Distinguish:

- liveness: process is running;
- readiness: application can serve traffic.

A database failure may make readiness fail without necessarily meaning the process itself is dead.

---

# 48. Logging

Use structured logs.

Every request should ideally have:

```text
requestId
timestamp
method
path
statusCode
duration
```

Sensitive values must be excluded.

Never log:

- passwords;
- access tokens;
- refresh tokens;
- payment secrets;
- sensitive personal data unnecessarily.

---

# 49. Observability

Monitor:

## Technical Metrics

- request count;
- latency;
- P50/P95/P99;
- HTTP errors;
- DB latency;
- DB connection pool;
- slow queries;
- Redis errors;
- CPU;
- memory;
- container health.

## Business Metrics

- orders/day;
- checkout success rate;
- payment failure rate;
- inventory conflict rate;
- cancellation rate;
- average order value;
- coupon usage.

---

# 50. Tracing and Correlation

Introduce request IDs.

Example:

```text
Client
  ↓
requestId = abc123
  ↓
API
  ↓
DB
  ↓
Payment provider
```

The same correlation identifier should make troubleshooting easier across logs and asynchronous operations where possible.

---

# 51. Monitoring Alerts

Potential alerts:

```text
P95 latency too high
Error rate above threshold
Checkout failure rate increased
Payment failures increased
Database latency increased
Redis unavailable
Inventory conflicts unusually high
Application unhealthy
```

Thresholds should be based on observed baseline and business impact.

---

# 52. Performance Testing

Performance testing must happen after the system is functionally correct.

Measure:

```text
Baseline
   ↓
Load
   ↓
Stress
   ↓
Observe
   ↓
Identify bottleneck
   ↓
Optimize
   ↓
Retest
```

Important workloads:

- product listing;
- product search;
- login;
- cart operations;
- checkout;
- order listing.

---

# 53. Performance Methodology

For each benchmark record:

```text
Test name
Environment
Concurrent users
Requests
Duration
P50
P95
P99
Throughput
Error rate
DB latency
CPU
Memory
```

Do not claim an optimization is successful without measuring before and after.

---

# 54. Failure Testing

Deliberately simulate:

- PostgreSQL unavailable;
- Redis unavailable;
- payment timeout;
- payment failure;
- duplicate webhook;
- duplicate checkout;
- concurrent inventory purchase;
- slow database query;
- application restart;
- container restart.

Document:

```text
Failure
→ Expected behavior
→ Actual behavior
→ Detection
→ Recovery
→ Remaining risk
```

---

# 55. CI/CD

Pipeline:

```text
Push
 ↓
Install dependencies
 ↓
Lint
 ↓
Type check
 ↓
Unit tests
 ↓
Integration tests
 ↓
E2E tests
 ↓
Build
 ↓
Security checks
 ↓
Build Docker image
 ↓
Publish image
 ↓
Deploy
 ↓
Health check
```

A failed critical test must block deployment.

---

# 56. Git Workflow

Use meaningful commits.

Examples:

```text
feat(products): add product creation
feat(inventory): add atomic stock deduction
fix(checkout): prevent duplicate order creation
test(orders): cover invalid transitions
perf(products): add catalog index
docs(architecture): explain modular monolith
```

Avoid giant commits that mix unrelated changes.

---

# 57. Database Migration Strategy

Never modify production schema manually without a documented migration process.

Flow:

```text
Schema Change
   ↓
Migration
   ↓
Test
   ↓
Review
   ↓
Deploy
   ↓
Verify
```

Backward-compatible migrations are preferred when rolling deployments are possible.

---

# 58. Deployment Architecture

Initial production evolution:

```text
                 Internet
                    |
                    v
          Load Balancer / Proxy
                    |
                    v
              NestJS API
               /       \
              v         v
        PostgreSQL     Redis
```

The actual cloud provider can be selected based on:

- cost;
- availability;
- learning goals;
- operational requirements.

---

# 59. Production Secrets

Secrets should be managed using the cloud/platform secret mechanism.

Do not store:

```text
.env
production.env
private keys
API secrets
```

in Git.

Rotate secrets according to operational requirements.

---

# 60. Backups

PostgreSQL production must have:

- automated backups;
- retention policy;
- restore procedure;
- restore testing.

A backup that has never been restored is not proven reliable.

Document:

```text
Backup frequency
Retention
Recovery Point Objective (RPO)
Recovery Time Objective (RTO)
Restore procedure
```

---

# 61. Disaster Recovery

Document what happens if:

- database is corrupted;
- application deployment fails;
- Redis is lost;
- cloud instance fails;
- payment provider is unavailable.

Define:

```text
Detection
Response
Recovery
Verification
Post-incident review
```

---

# 62. Security Threat Model

Identify threats such as:

- credential theft;
- brute force;
- privilege escalation;
- broken object-level authorization;
- mass assignment;
- SQL injection;
- malicious input;
- replayed payment webhooks;
- duplicate checkout;
- leaked secrets;
- excessive data exposure.

For each threat:

```text
Threat
→ Attack surface
→ Mitigation
→ Test
```

---

# 63. Authorization Boundaries

Explicitly document:

```text
Customer
  → Own profile
  → Own cart
  → Own orders
  → Own reviews

Staff
  → Assigned permissions

Admin
  → Administrative resources
```

Every sensitive endpoint must have an authorization reason.

---

# 64. Auditability

Audit records should answer:

```text
Who?
What?
When?
Which resource?
What changed?
From where?
Request ID?
```

Do not store unnecessary sensitive data in audit logs.

---

# 65. Reports

Initial reports may include:

- orders by day;
- revenue by period;
- top products;
- failed payments;
- inventory conflicts;
- coupon usage.

Reports should be optimized separately from transactional queries if the workload grows.

---

# 66. Notifications

Use a notification abstraction:

```text
NotificationService
       |
       +-- EmailProvider
       +-- SMSProvider
       +-- PushProvider
```

For asynchronous delivery:

```text
Business Event
      ↓
Queue
      ↓
Worker
      ↓
Provider
```

Queues should be introduced when asynchronous processing provides a clear benefit.

---

# 67. Queue Decision

Do not add a queue simply because queues are useful.

A queue becomes justified when:

- work is slow;
- work does not need to block the HTTP response;
- retries are useful;
- workload spikes need buffering;
- provider calls are unreliable/slow.

Potential queue workloads:

- emails;
- notifications;
- webhook processing;
- report generation.

---

# 68. Consistency Strategy

Classify operations.

## Strong consistency

Use database transactions/constraints for:

- inventory;
- order totals;
- payment records;
- coupon usage.

## Eventual consistency

Acceptable for:

- notifications;
- analytics;
- non-critical search indexes.

Document every deliberate consistency trade-off.

---

# 69. Checkout Failure Matrix

| Failure | Expected Strategy |
|---|---|
| Duplicate request | Idempotency |
| Inventory unavailable | Reject/reserve safely |
| DB transaction failure | Rollback |
| Payment declined | Payment failed state |
| Payment timeout | Do not assume failure |
| Provider webhook duplicate | Deduplicate |
| Redis unavailable | Core correctness survives |
| API crash after payment | Reconciliation/webhook |
| Client retry | Safe idempotent behavior |

---

# 70. Architectural Decision Records

Create ADRs for major decisions.

Example:

```text
ADR-001 Modular Monolith
ADR-002 PostgreSQL
ADR-003 ORM Selection
ADR-004 Redis Usage
ADR-005 Inventory Concurrency Strategy
ADR-006 Idempotency Strategy
ADR-007 Authentication Strategy
ADR-008 Payment Abstraction
ADR-009 Queue Introduction
ADR-010 Deployment Architecture
```

Each ADR:

```text
# Title

## Context

## Decision

## Alternatives

## Trade-offs

## Consequences

## When to Revisit
```

---

# 71. Definition of Done

## Product

- [ ] Problem defined
- [ ] Users defined
- [ ] Value proposition defined
- [ ] Success metrics defined

## Requirements

- [ ] Functional requirements
- [ ] Non-functional requirements
- [ ] Acceptance criteria

## Design

- [ ] Domain model
- [ ] ERD
- [ ] Architecture
- [ ] API contract
- [ ] Threat model
- [ ] ADRs

## Backend

- [ ] Auth
- [ ] RBAC
- [ ] Products
- [ ] Categories
- [ ] Inventory
- [ ] Cart
- [ ] Orders
- [ ] State machine
- [ ] Payments
- [ ] Shipping
- [ ] Coupons
- [ ] Notifications
- [ ] Reviews
- [ ] Audit logs
- [ ] Health

## Reliability

- [ ] Transactions
- [ ] Idempotency
- [ ] Concurrency control
- [ ] Webhook deduplication
- [ ] Retry strategy
- [ ] Timeout handling
- [ ] Recovery strategy

## Security

- [ ] Password hashing
- [ ] Access tokens
- [ ] Refresh tokens
- [ ] RBAC
- [ ] Ownership checks
- [ ] Validation
- [ ] Rate limiting
- [ ] CORS
- [ ] Secure headers
- [ ] Secrets management
- [ ] Audit logs
- [ ] Mass-assignment protection

## Testing

- [ ] Unit
- [ ] Integration
- [ ] E2E
- [ ] Concurrency tests
- [ ] Failure tests
- [ ] Security tests

## Operations

- [ ] Docker
- [ ] CI/CD
- [ ] Production deployment
- [ ] Logging
- [ ] Metrics
- [ ] Health checks
- [ ] Alerts
- [ ] Backups
- [ ] Restore test

## Performance

- [ ] Baseline
- [ ] Load test
- [ ] Bottleneck analysis
- [ ] Optimization
- [ ] Retest

## Documentation

- [ ] README
- [ ] Architecture
- [ ] API
- [ ] Database
- [ ] Security
- [ ] Reliability
- [ ] Operations
- [ ] ADRs
- [ ] Case study

## Launch

- [ ] Production URL
- [ ] Swagger
- [ ] Monitoring
- [ ] Demo account where appropriate
- [ ] Public repository
- [ ] Technical case study
- [ ] Portfolio entry

---

# 72. 20-Phase End-to-End Execution Plan

## Phase 01 — Problem & Product Discovery

Deliver:

- problem statement;
- target users;
- business goals;
- assumptions;
- constraints;
- success metrics.

Exit criteria:

- problem can be explained in 2 minutes;
- success can be measured.

---

## Phase 02 — Requirements Engineering

Deliver:

- functional requirements;
- non-functional requirements;
- user stories;
- acceptance criteria;
- edge cases.

Exit criteria:

- no major undefined workflow remains.

---

## Phase 03 — Domain Modeling

Deliver:

- entities;
- aggregates;
- relationships;
- domain rules;
- state machines;
- invariants.

Focus:

```text
Order
Inventory
Payment
Coupon
User
```

---

## Phase 04 — Architecture

Deliver:

- architecture diagram;
- module boundaries;
- request flow;
- dependency rules;
- ADRs.

Decide:

- modular monolith;
- persistence strategy;
- Redis usage;
- payment abstraction.

---

## Phase 05 — Database Design

Deliver:

- ERD;
- schema;
- constraints;
- indexes;
- migrations;
- seed strategy.

Prove:

- uniqueness;
- referential integrity;
- inventory invariants.

---

## Phase 06 — API Contract

Deliver:

- REST resources;
- endpoint list;
- DTOs;
- response formats;
- errors;
- pagination;
- Swagger contract.

---

## Phase 07 — Project Foundation

Build:

- NestJS project;
- configuration;
- logging;
- validation;
- exception handling;
- database integration;
- environment handling.

Result:

A clean runnable skeleton.

---

## Phase 08 — Authentication & Authorization

Build:

- registration;
- login;
- hashing;
- access tokens;
- refresh tokens;
- RBAC;
- permissions;
- ownership checks.

Test:

- unauthorized;
- forbidden;
- token expiration;
- ownership.

---

## Phase 09 — Catalog

Build:

- products;
- categories;
- search;
- filtering;
- pagination;
- caching where justified.

Measure:

- query performance;
- cache hit/miss.

---

## Phase 10 — Inventory

Build:

- inventory;
- movements;
- adjustments;
- reservation/deduction;
- concurrency control.

Critical proof:

Two users cannot successfully purchase the same final unit.

---

## Phase 11 — Cart & Pricing

Build:

- cart;
- cart items;
- pricing;
- coupon calculation;
- validation.

Unit-test all pricing rules.

---

## Phase 12 — Orders & Checkout

Build:

- order creation;
- snapshots;
- order items;
- transactions;
- idempotency;
- state machine.

This is the core reliability phase.

---

## Phase 13 — Payments & Shipping

Build:

- payment abstraction;
- mock provider;
- payment state;
- webhook handling;
- webhook deduplication;
- shipment lifecycle;
- tracking.

Test provider failure scenarios.

---

## Phase 14 — Notifications, Reviews & Audit

Build:

- notifications;
- review rules;
- moderation;
- audit logs.

Introduce async processing only where justified.

---

## Phase 15 — Comprehensive Testing

Build:

- unit tests;
- integration tests;
- E2E tests;
- concurrency tests;
- security tests;
- failure tests.

Target behavior, not arbitrary coverage percentage.

---

## Phase 16 — Docker & Local Production Parity

Build:

- Dockerfile;
- Docker Compose;
- health checks;
- persistent volumes;
- test environment;
- production-oriented container.

---

## Phase 17 — CI/CD

Build:

- lint;
- type-check;
- tests;
- build;
- security checks;
- image build;
- deployment pipeline.

---

## Phase 18 — Production Deployment

Deploy:

- API;
- PostgreSQL;
- Redis;
- reverse proxy/load balancer;
- secrets;
- TLS;
- backups.

Verify:

- migrations;
- health;
- logs;
- API;
- rollback.

---

## Phase 19 — Observability, Performance & Failure Testing

Implement:

- structured logging;
- metrics;
- alerts;
- request IDs;
- performance baseline;
- load testing;
- failure injection.

Produce actual measurements.

---

## Phase 20 — Documentation & Public Launch

Deliver:

- polished README;
- architecture documentation;
- ADRs;
- API documentation;
- security documentation;
- reliability documentation;
- performance report;
- production screenshots;
- technical case study;
- public repository;
- portfolio entry.

Final statement should be evidence-based:

```text
We built it.
We tested it.
We deployed it.
We broke it.
We measured it.
We fixed it.
We documented it.
```

---

# 73. Repository Documentation

Recommended final repository:

```text
README.md

docs/
├── 01-product/
│   ├── problem.md
│   ├── requirements.md
│   └── metrics.md
│
├── 02-design/
│   ├── domain-model.md
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   └── security.md
│
├── 03-reliability/
│   ├── idempotency.md
│   ├── transactions.md
│   ├── concurrency.md
│   ├── payments.md
│   └── failure-modes.md
│
├── 04-operations/
│   ├── docker.md
│   ├── deployment.md
│   ├── ci-cd.md
│   ├── observability.md
│   └── disaster-recovery.md
│
├── 05-testing/
│   ├── testing-strategy.md
│   ├── integration-testing.md
│   └── performance.md
│
├── decisions/
│   ├── ADR-001.md
│   ├── ADR-002.md
│   └── ...
│
└── case-study.md
```

---

# 74. Technical Case Study Template

At project completion, write:

## Problem

What business/technical problem existed?

## Constraints

What limitations existed?

## Initial Design

What architecture was selected?

## Difficult Problems

Examples:

- duplicate checkout;
- inventory race condition;
- payment uncertainty;
- authorization;
- cache consistency.

## Alternatives

What other approaches were considered?

## Decision

Why was the final approach selected?

## Implementation

How was it implemented?

## Testing

What tests prove correctness?

## Production

Where was it deployed?

## Observability

How is failure detected?

## Performance

What were the measured results?

## Failure Testing

What was intentionally broken?

## Improvements

What changed after measurement?

## Lessons

What would you do differently at larger scale?

---

# 75. Engineering Questions You Must Be Able to Answer

## Architecture

- Why modular monolith?
- What are the module boundaries?
- What is the first bottleneck?
- How would the system scale?
- When would you introduce microservices?

## Database

- Why PostgreSQL?
- Why these indexes?
- Where are transactions needed?
- What constraints enforce correctness?
- What happens under concurrent writes?

## Backend

- How are errors represented?
- How does authentication work?
- How does authorization work?
- How is ownership enforced?
- How is mass assignment prevented?

## Reliability

- What happens during a retry?
- What happens during a timeout?
- What happens after a crash?
- How is duplicate checkout prevented?
- How is duplicate webhook processing prevented?
- How is inventory protected?

## Security

- What is the threat model?
- Where are authorization boundaries?
- How are secrets protected?
- What sensitive actions are audited?

## Production

- How is it deployed?
- How is it monitored?
- How do you know it failed?
- How do you recover?
- How do you roll back?

## Product

- Who is the user?
- What problem is being solved?
- What value is created?
- Which metrics define success?

---

# 76. Technology Decision Matrix

| Technology | Problem | Why | Alternative | Trade-off |
|---|---|---|---|---|
| NestJS | Backend structure | Modular architecture | Express/Fastify | More framework conventions |
| PostgreSQL | Transactional data | Strong consistency | MongoDB/MySQL | Relational modeling required |
| Redis | Fast temporary data | Low latency | In-memory/local cache | Operational dependency |
| Docker | Environment consistency | Reproducibility | Native setup | Container complexity |
| Swagger | API contract | Discoverability | Manual docs | Requires maintenance |
| Jest | Automated tests | NestJS ecosystem | Vitest/Mocha | Tooling choice |
| CI/CD | Repeatable delivery | Automation | Manual deployment | Pipeline maintenance |

The final project must contain ADRs explaining the actual decisions.

---

# 77. What Success Looks Like

This project is successful when it demonstrates more than endpoint count.

It should prove that the engineer can:

```text
Understand a problem
      ↓
Model a domain
      ↓
Design a system
      ↓
Make trade-offs
      ↓
Implement safely
      ↓
Test failure scenarios
      ↓
Deploy
      ↓
Observe
      ↓
Measure
      ↓
Improve
```

The portfolio value comes from the engineering evidence.

---

# 78. Final Engineering Principle

> **Build less. Understand more. Ship seriously. Measure everything.**

Do not optimize for:

```text
More modules
More libraries
More microservices
More buzzwords
More endpoints
```

Optimize for:

```text
Correctness
Clarity
Reliability
Security
Measurability
Maintainability
Real production behavior
```

The final question is not:

> "How many technologies did we use?"

It is:

> **"What problem did we solve, why did we design it this way, what happened when things failed, and what evidence proves that the system works?"**

---

# 79. Final Project Checklist

```text
[ ] Problem
[ ] Product requirements
[ ] Functional requirements
[ ] Non-functional requirements
[ ] Domain model
[ ] Architecture
[ ] ADRs
[ ] ERD
[ ] Database schema
[ ] Constraints
[ ] Indexes
[ ] API contract
[ ] Authentication
[ ] Authorization
[ ] Products
[ ] Categories
[ ] Inventory
[ ] Concurrency control
[ ] Cart
[ ] Pricing
[ ] Coupons
[ ] Orders
[ ] State machine
[ ] Idempotency
[ ] Transactions
[ ] Payments
[ ] Webhooks
[ ] Shipping
[ ] Notifications
[ ] Reviews
[ ] Audit logs
[ ] Unit tests
[ ] Integration tests
[ ] E2E tests
[ ] Concurrency tests
[ ] Failure tests
[ ] Security tests
[ ] Swagger
[ ] Docker
[ ] Docker Compose
[ ] CI/CD
[ ] Production deployment
[ ] Secrets management
[ ] Backups
[ ] Health checks
[ ] Structured logging
[ ] Metrics
[ ] Monitoring
[ ] Alerts
[ ] Performance baseline
[ ] Load testing
[ ] Failure testing
[ ] Recovery testing
[ ] Technical documentation
[ ] Case study
[ ] Public launch
```

---

# 80. Final Definition

**Commerce & Order Management Platform** is complete only when:

1. It solves a clearly defined commerce problem.
2. Its architecture is explainable.
3. Its database enforces important invariants.
4. Its API is documented.
5. Its security boundaries are explicit.
6. Its checkout is transactionally and operationally safe.
7. Duplicate operations are handled.
8. Concurrent inventory operations are safe.
9. Payment uncertainty is handled.
10. Failures are observable.
11. Automated tests prove critical behavior.
12. The application runs in Docker.
13. CI/CD can deliver it.
14. It is deployed to production.
15. Performance is measured.
16. Failures are intentionally tested.
17. Recovery is documented.
18. Architectural decisions are documented.
19. The technical case study contains evidence.
20. The project is publicly presentable.

**This is not a CRUD project.**

It is a production engineering exercise designed to demonstrate:

> **Backend Engineering + System Design + Reliability + Security + DevOps + Observability + Product Thinking.**
