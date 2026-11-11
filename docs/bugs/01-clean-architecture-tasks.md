# 01 — Clean Architecture Refactoring Tasks Checklist

> **Objective:** Step-by-step actionable checklist to refactor `src/` from an anemic Transaction-Script modular monolith into a strict Clean Architecture (Domain / Application / Infrastructure / Presentation layers) without breaking existing REST API contracts or TypeORM migrations.

---

## Phase 1: Shared Kernel & Core Domain Primitives (`src/common/`)

- [x] **1.1 Create Pure Domain Building Blocks (`src/common/domain/`)**
  - [x] Create `src/common/domain/entity.base.ts` (`BaseEntity<TId>` with identity equality check).
  - [x] Create `src/common/domain/aggregate-root.base.ts` (`AggregateRoot<TId>` extending `BaseEntity<TId>` with `domainEvents: DomainEvent[]`, `addDomainEvent()`, `pullDomainEvents()`).
  - [x] Create `src/common/domain/value-object.base.ts` (`ValueObject<TProps>` with structural immutability `Object.freeze` and `equals()`).
  - [x] Create `src/common/domain/domain-event.base.ts` (`DomainEvent` interface with `eventId`, `occurredOn`, `aggregateId`, `eventName`).
  - [x] Create `src/common/domain/domain-exception.base.ts` (`DomainException` with `code: string`, plus subtypes: `EntityNotFoundDomainException`, `BusinessRuleViolationException`, `ConflictDomainException`, `UnauthorizedDomainException`, `ForbiddenDomainException`).
  - [x] Create `src/common/domain/money.vo.ts` (`Money` Value Object handling minor-unit precision arithmetic safely).

- [x] **1.2 Create Shared Application Ports (`src/common/application/`)**
  - [x] Create `src/common/application/unit-of-work.port.ts` (`IUnitOfWork` token & interface: `runInTransaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T>`).
  - [x] Create `src/common/application/event-bus.port.ts` (`IDomainEventBus` token & interface: `publish(event: DomainEvent): Promise<void>`, `publishAll(events: DomainEvent[]): Promise<void>`).
  - [x] Create `src/common/application/cache.port.ts` (`ICachePort` token & interface: `get(key: string): Promise<string | null>`, `set(key: string, value: string, ttlSeconds?: number): Promise<void>`, `del(key: string): Promise<void>`).

- [x] **1.3 Create Shared Infrastructure Adapters (`src/common/infrastructure/`)**
  - [x] Create `src/common/infrastructure/persistence/typeorm-unit-of-work.ts` implementing `IUnitOfWork`.
  - [x] Create `src/common/infrastructure/event-bus/event-emitter-domain-event-bus.ts` implementing `IDomainEventBus` over `@nestjs/event-emitter`.
  - [x] Update `src/common/filters/all-exceptions.filter.ts` to map `DomainException` subclasses into standard HTTP error envelopes.

---

## Phase 2: Identity & Access Bounded Contexts (`src/users/`, `src/auth/`, `src/redis/`)

- [x] **2.1 Refactor `src/redis/` into an Infrastructure Adapter for `ICachePort`**
  - [x] Implement `ICachePort` in `src/redis/redis.service.ts` and export the `CACHE_PORT` token from `RedisModule`.
- [x] **2.2 Refactor `src/users/` into Clean Architecture Layers**
  - [x] Encapsulate role & permission extraction on `User` (`getRoleNames()`, `getPermissionActions()`).
  - [x] Create `src/users/domain/ports/user.repository.port.ts` (`IUserRepositoryPort`).
  - [x] Update `UsersService` to implement `IUserRepositoryPort` and execute user creation + default `CUSTOMER` role assignment inside a single atomic transaction (`createCustomerUser`).
- [x] **2.3 Refactor `src/auth/` to Remove Cross-Module `UserRole` Repository Injection**
  - [x] Remove `TypeOrmModule.forFeature([UserRole])` from `src/auth/auth.module.ts` and `@InjectRepository(UserRole)` from `src/auth/auth.service.ts`.
  - [x] Delegate user + default role creation in `AuthService.register()` to `UsersService.createCustomerUser()`.

---

## Phase 3: Catalog, Inventory & Coupons Bounded Contexts (`src/inventory/`, `src/catalog/`, `src/coupons/`)

- [x] **3.1 Refactor `src/inventory/` into Rich Domain & Exported Ports**
  - [x] Add rich domain methods on `Inventory` (`reserve`, `release`, `deductReserved`, `adjust`).
  - [x] Create `src/inventory/application/ports/inventory-reservation.port.ts` (`IInventoryReservationPort`).
  - [x] Refactor `InventoryService` to support shared transactional `EntityManager` execution across modules.
  - [x] Export `INVENTORY_RESERVATION_PORT` from `InventoryModule`.

- [x] **3.2 Refactor `src/catalog/` to Remove Direct `Inventory` & `Category` Repository Access in `ProductsModule`**
  - [x] Remove `Inventory` and `Category` from `TypeOrmModule.forFeature([Product])` in `src/catalog/products/products.module.ts`.
  - [x] Inject `CategoriesService` and `InventoryService` into `ProductsService` and create `Product` + `Inventory` atomically inside a single transaction.

- [x] **3.3 Refactor `src/coupons/` into a Rich Domain Entity & Exported Evaluator Port**
  - [x] Add domain methods on `Coupon` (`validateApplicable`, `calculateDiscount`, `incrementUsage`).
  - [x] Create `src/coupons/application/ports/coupon.port.ts` (`ICouponPort`) and export `COUPON_PORT` from `CouponsModule`.

---

## Phase 4: Cart & Pricing Bounded Context (`src/cart/`)

- [x] **4.1 Decouple `src/cart/` from `Product` and `Coupon` Repositories**
  - [x] Remove `Product` and `Coupon` from `TypeOrmModule.forFeature([Cart, CartItem])` in `src/cart/cart.module.ts`.
  - [x] Import `ProductsModule` and `CouponsModule` into `CartModule` and use `ProductsService` and `CouponsService`.
- [x] **4.2 Refactor `CartService` & `PricingService`**
  - [x] Refactor `PricingService` to use `Money` Value Object, `Coupon.calculateDiscount()`, and `BusinessRuleViolationException`.
  - [x] Expose `clearCart(cart, manager)` on `CartService` for `OrdersService` to consume.

---

## Phase 5: Orders, Payments, Shipping & Reviews Bounded Contexts

- [x] **5.1 Refactor `src/orders/` into Rich `Order` Domain State Machine & Use Cases**
  - [x] Add domain state transition methods on `Order` (`markPaid`, `markPaymentFailed`, `markShipped`, `markDelivered`).
  - [x] Refactor `OrdersService.checkout()` to redeem applied coupons (`couponsService.redeemCoupon`), clear the cart via `cartService.clearCart()`, and emit `order.placed`.
  - [x] Expose `confirmOrderPayment()`, `failOrderPayment()`, `markOrderShipped()`, `markOrderDelivered()`, and `hasUserPurchasedProduct()` (`VERIFIED_PURCHASE_PORT`) from `OrdersModule`.

- [x] **5.2 Refactor `src/payments/` to Respect the `OrdersModule` & `InventoryModule` Boundaries**
  - [x] Import `OrdersModule` into `PaymentsModule` and delegate `payment.succeeded` / `payment.failed` state transitions and inventory deduction/release to `OrdersService.confirmOrderPayment()` and `OrdersService.failOrderPayment()`.

- [x] **5.3 Refactor `src/shipping/` to Synchronize Order Lifecycle State**
  - [x] Add rich domain methods on `Shipment` (`dispatch()`, `markDelivered()`).
  - [x] Import `OrdersModule` into `ShippingModule` and call `ordersService.markOrderShipped()` on dispatch and `ordersService.markOrderDelivered()` on delivery.

- [x] **5.4 Refactor `src/reviews/` to Remove Direct `Order` Repository Queries**
  - [x] Remove `Order` from `TypeOrmModule.forFeature([Review])` in `src/reviews/reviews.module.ts`.
  - [x] Inject `OrdersService` (`IVerifiedPurchasePort`) to verify customer purchase history via `hasUserPurchasedProduct(userId, productId)`.

---

## Phase 6: Notifications & Audit Cross-Cutting Adapters (`src/notifications/`, `src/audit/`)

- [x] **6.1 Refactor `src/notifications/` with `INotificationSenderPort`**
  - [x] Create `INotificationSenderPort` (`src/notifications/application/ports/notification-sender.port.ts`) and `ConsoleEmailNotificationAdapter` (`src/notifications/infrastructure/adapters/console-email.adapter.ts`).

- [x] **6.2 Wire `src/audit/` into Domain Events**
  - [x] Subscribe `AuditService` event listeners to `order.placed`, `order.paid`, and `order.cancelled`.
