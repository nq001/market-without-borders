# Architecture Specification: Hexagonal Modular Monolith

## 1. Architectural Philosophy & Dependency Rule

The platform adopts a **Hexagonal (Ports & Adapters) Modular Monolith** architecture. The core domain layer has zero dependencies on external frameworks, databases, or third-party SDKs. 

```
+---------------------------------------------------------------------------------+
|                                 Driving Adapters                                |
|  - React 19 Frontend UI (Super Admin, Store Owner, Customer Experience)         |
|  - REST API Controllers (NestJS HTTP Layer)                                     |
|  - Scheduled Cron Jobs (Inventory TTL release, Payout batch settlements)        |
+---------------------------------------+-----------------------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------+
|                               Application Ports                                 |
|  - IUnitOfWorkPort (Transactional scope boundary)                               |
|  - IDomainEventBusPort (In-memory asynchronous domain events)                   |
|  - IVerifiedPurchasePort (Verified customer review verification)                |
|  - INotificationSenderPort (Email/In-App alert delivery)                        |
|  - ICachePort (Key-value store & concurrency lock interface)                    |
+---------------------------------------+-----------------------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------+
|                                  Core Domain                                    |
|  - Aggregates: Store, User, Product, Inventory, Cart, Order, Complaint          |
|  - Value Objects: Money (Minor Units), StoreSlug, AddressSnapshot               |
|  - Domain Exceptions: ConflictDomainException, BusinessRuleViolationException   |
|  - Finite State Machines: OrderStatus, StoreStatus, StoreEditRequestStatus      |
+---------------------------------------+-----------------------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------+
|                                 Driven Adapters                                 |
|  - TypeORM Repository Implementations                                           |
|  - PostgreSQL 16 ACID Persistence (Pessimistic Row Locks: SELECT FOR UPDATE)     |
|  - In-Memory Key-Value & Lock Store (Docker-free resilient fallback)             |
|  - Console Email & Notification Adapters                                        |
+---------------------------------------------------------------------------------+
```

---

## 2. Bounded Context Boundaries

```
[Tenancy & Stores] <------> [Identity & Users]
        |                           |
        |                           |
        v                           v
   [Catalog] <--------------> [Inventory]
        |                           |
        +-------------+-------------+
                      |
                      v
              [Cart & Pricing]
                      |
                      v
             [Orders & Checkout]
                      |
        +-------------+-------------+
        |                           |
        v                           v
  [Fulfillment]             [Disputes & Auditing]
```

### Module Responsibilities:
1. **Tenancy & Stores (`stores/` & `store-requests/`):** Manages multi-store tenant metadata, store categories, status (`ACTIVE`, `PENDING`, `SUSPENDED`), and store profile edit requests with side-by-side verification.
2. **Identity & Access (`users/` & `auth/`):** JWT token issuance, password hashing, user approval pipeline, and Role-Based Access Control (`ADMIN`, `OWNER`, `CUSTOMER`).
3. **Catalog (`catalog/`):** Category hierarchy and product definitions linked directly to stores with visibility rules.
4. **Inventory (`inventory/`):** Real-time stock counters with pessimistic row locks (`SELECT FOR UPDATE`), preventing overselling during flash-sale conditions.
5. **Cart & Pricing (`cart/` & `coupons/`):** Shared multi-store shopping cart, minor-unit money arithmetic (zero float errors), and store-specific coupon validation.
6. **Orders & Checkout (`orders/`):** Decomposes composite shopping carts into individual store sub-orders within an atomic transactional unit of work.
7. **Fulfillment (`payments/` & `shipping/`):** Payment webhooks, idempotency cache, tracking numbers, and delivery milestone enforcement.
8. **Disputes & Governance (`complaints/` & `audit/`):** Supervised complaints tribunal, auto-suspension triggers, and immutable platform activity logs.

