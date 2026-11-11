# 02 — Clean Code Audit & Refactoring Plan

> **Scope:** File-by-file Clean Code, functional correctness, type-safety, performance, and unit-test audit across every directory in `src/`.

---

## 1. Executive Summary of Clean Code Findings

A comprehensive static and runtime inspection of all files in `src/` uncovered **24 distinct code quality, functional bug, type-safety, and test-suite defects**:
1. **Critical Runtime Bug (`sub` vs `id`)**: JWT tokens encode `sub: user.id`, which `JwtAuthGuard` attaches to `request.user` (`request.user.sub`), yet `CartController`, `OrdersController`, and `ReviewsController` all read `req.user.id` (`undefined` at runtime!). Meanwhile, `@CurrentUser()` (`src/auth/decorators/current-user.decorator.ts`) is completely unused dead code.
2. **Broken Unit Tests (`npm test` fails out of the box)**: 4 of the 8 spec files (`cart.controller.spec.ts`, `cart.service.spec.ts`, `coupons.controller.spec.ts`, `orders.controller.spec.ts`) are unmocked `nest g` boilerplate that crash immediately with `Nest can't resolve dependencies`.
3. **Production Crash Bug in Logger**: `src/app.module.ts` unconditionally loads `pino-pretty`, which is a `devDependency` and crashes the app on startup in production (`npm ci --omit=dev`).
4. **Severe Caching Bug**: `ProductsController.findAll()` uses a static `@CacheKey('catalog_products')`, causing every user query (`?page=2`, `?category_id=...`, `?search=...`) to return the exact same cached first page for 60 seconds.
5. **Dead Code & Disconnected State Machines**: `AuditService` is never called anywhere; `InventoryService.deductInventory` is never called; `ShippingService` never updates `Order.status` to `SHIPPED` or `DELIVERED`; `Coupons` `times_used` is never incremented on checkout.

---

## 2. Folder-by-Folder Clean Code Audit & Remediation

### 2.1 Root Bootstrap & Configuration (`src/main.ts`, `src/app.module.ts`)

| File & Lines | Clean Code / Bug Finding | How to Fix |
| :--- | :--- | :--- |
| `src/main.ts:37` | Hardcodes `await app.listen(3000)` instead of reading `PORT` from `ConfigService` (even though `PORT` is validated in `app.module.ts:36`). | Resolve `const configService = app.get(ConfigService);` and call `await app.listen(configService.get<number>('PORT', 3000));`. |
| `src/app.module.ts:46-52` | Unconditionally configures `transport: { target: 'pino-pretty' }`. Because `pino-pretty` is in `package.json` `devDependencies`, running in production with `NODE_ENV=production` and `--omit=dev` crashes at startup. | Conditionally enable `pino-pretty` only when `configService.get('NODE_ENV') !== 'production'` via `LoggerModule.forRootAsync`. |

---

### 2.2 Common Layer (`src/common/`)

| File & Lines | Clean Code / Bug Finding | How to Fix |
| :--- | :--- | :--- |
| `src/common/filters/all-exceptions.filter.ts:34-36` | `const message = Array.isArray(messageStr) ? messageStr[0] : messageStr;` silently discards all validation errors except the first one, making form/API debugging painful. Also uses untyped `as any` casts (`lines 32, 41`). | Preserve `details: Array.isArray(messageStr) ? messageStr : undefined` in the error response object and type the `HttpException` response body via an interface instead of `as any`. |
| `src/common/filters/all-exceptions.filter.ts:39-44` | Non-`HttpException` errors only log if `exception instanceof Error`. Non-Error throws (strings/objects) are swallowed without logging. | Always log unhandled exceptions in the `else` branch with fallback serialization. |
| `src/common/interceptors/transform.interceptor.ts:21` | Uses `const request = context.switchToHttp().getRequest();` without typing `Request` from `express`. | Type `getRequest<Request>()` explicitly. |

---

### 2.3 Authentication & Authorization (`src/auth/`, `src/users/`)

| File & Lines | Clean Code / Bug Finding | How to Fix |
| :--- | :--- | :--- |
| `src/auth/interfaces/token-payload.interface.ts:2` vs `src/cart/cart.controller.ts`, `src/orders/orders.controller.ts`, `src/reviews/reviews.controller.ts` | **CRITICAL BUG:** `TokenPayload` defines `sub: string` (user ID). `JwtAuthGuard` sets `request['user'] = payload`. However, `CartController`, `OrdersController`, and `ReviewsController` all access `req.user.id` (which is `undefined`!). Only `AuthController.logout` correctly uses `req.user['sub']`. | 1. Normalize `request.user` in `JwtAuthGuard` to `{ id: payload.sub, ...payload }` **AND** use the typed `@CurrentUser()` decorator (`@CurrentUser('sub') userId: string`) across all controllers instead of raw `@Request() req`. |
| `src/auth/decorators/current-user.decorator.ts:1-8` | Dead code—defined but never imported in any controller. | Update `@CurrentUser(property?: keyof TokenPayload)` and use it in `AuthController`, `CartController`, `OrdersController`, and `ReviewsController`. |
| `src/auth/auth.service.ts:44-55` | `register()` creates the `User` (`usersService.createUser`) and then separately inserts `UserRole` (`userRoleRepository.save`) outside of a transaction. If role assignment fails, an orphan user with no role remains in the DB. | Wrap user + default role creation in a single database transaction inside `UsersService`. |
| `src/auth/auth.service.ts:94-99` | Uses `as any` twice (`expiresIn: ... as any`) and parses `JWT_REFRESH_EXPIRATION` strictly via `endsWith('d')`, falling back to `604800` if `h` or `m` is used. | Parse duration units (`d`, `h`, `m`, `s`) via a clean helper function `parseDurationToSeconds(raw: string): number`. |
| `src/database/seeds/initial-seed.ts:22-25` vs Controllers | **Permission Naming Bug:** `initial-seed.ts` seeds permissions `'inventory.update'` and `'catalog.manage'`, whereas controllers require `@Permissions('ADJUST_INVENTORY')` (`inventory.controller.ts:21`), `@Permissions('CREATE_PRODUCT')` (`products.controller.ts:34`), and `@Permissions('ADMIN')` (`shipping.controller.ts:21,29` — using a role name inside `@Permissions()`!). | Define a single `PermissionCode` enum in `src/common/constants/permissions.enum.ts` and use it consistently in both `initial-seed.ts` and `@Permissions()` decorators. |

---

### 2.4 Audit Module (`src/audit/`)

| File & Lines | Clean Code / Bug Finding | How to Fix |
| :--- | :--- | :--- |
| `src/audit/audit.service.ts:1-34` | **100% Dead Code & Untyped `any`:** `AuditService.logAction()` is never called anywhere in `src/`, and uses `oldValues?: any, newValues?: any`. | Replace `any` with `Record<string, unknown> \| null` and invoke `AuditService.logAction()` (or emit audit domain events) on order checkout, payment status change, inventory adjustment, and shipment dispatch. |

---

### 2.5 Cart & Pricing (`src/cart/`)

| File & Lines | Clean Code / Bug Finding | How to Fix |
| :--- | :--- | :--- |
| `src/cart/cart.service.ts:46-138` | **Redundant DB Queries:** `addItem`, `updateItemQuantity`, `removeItem`, and `applyCoupon` each call `await this.getCartAndPricing(userId)` at the start (which runs full DB relations + pricing calculation) and then call `return this.getCartAndPricing(userId)` **again** at the end. | Split internal cart entity retrieval (`private getOrCreateCartEntity(userId): Promise<Cart>`) from pricing calculation (`getCartAndPricing(userId)`), so mutations only calculate pricing once at the end. |
| `src/cart/cart.service.ts:51-57` | `addItem()` checks if `product.status === ProductStatus.ACTIVE` but never checks if `quantity > 0` or if requested quantity exceeds available inventory. | Validate `dto.quantity > 0` and verify available stock before adding/incrementing cart items. |
| `src/cart/cart.controller.spec.ts` & `src/cart/cart.service.spec.ts` | **Broken Tests:** Both spec files fail immediately because dependencies (`CartService`, `getRepositoryToken(Cart)`, etc.) are not provided in `Test.createTestingModule()`. | Provide proper mocks for all injected dependencies and write unit tests for cart mutations and pricing calculation. |

---

### 2.6 Catalog (`src/catalog/`)

| File & Lines | Clean Code / Bug Finding | How to Fix |
| :--- | :--- | :--- |
| `src/catalog/products.controller.ts:41-42` | **CRITICAL CACHING BUG:** `@UseInterceptors(CacheInterceptor)` combined with `@CacheKey('catalog_products')` forces NestJS to store and serve the exact same cache key `'catalog_products'` regardless of query parameters (`?page=2&limit=5&category_id=...&search=laptop`). Furthermore, creating, updating, or deleting a product never invalidates the cache. | Remove the static `@CacheKey('catalog_products')` decorator so `CacheInterceptor` keys by the full request URL (including query string), or implement a custom cache key generator + invalidate cache keys in `create()`, `update()`, and `remove()`. |
| `src/catalog/products.service.ts:21-44` | `ProductsService.create()` saves `Product` and then saves `Inventory` in two separate non-transactional queries, and returns `savedProduct` without the created `inventory` relation attached. | Execute product + initial inventory creation inside a single transaction. |
| `src/catalog/categories.service.ts:15-52` | `create()` and `update()` accept `parent_id` without verifying that the parent category exists or preventing self-parenting (`id === parent_id`) / circular category trees. | Validate that `parent_id !== id`, verify the parent category exists via `findOne(dto.parent_id)`, and check for ancestor cycles before saving. |

---

### 2.7 Coupons (`src/coupons/`)

| File & Lines | Clean Code / Bug Finding | How to Fix |
| :--- | :--- | :--- |
| `src/coupons/coupons.service.ts:16-24` | `create()` does not validate that `expires_at > starts_at`, nor that percentage discounts are `<= 100`. | Validate date range (`expires_at > starts_at`) and percentage bounds (`1..100`), and normalize coupon codes to uppercase (`code.trim().toUpperCase()`). |
| `src/coupons/coupons.controller.spec.ts:1-18` | **Broken Test:** Unmocked `CouponsService` causes `npm test` to fail. | Mock `CouponsService` in `coupons.controller.spec.ts`. |

---

### 2.8 Health (`src/health/`)

| File & Lines | Clean Code / Bug Finding | How to Fix |
| :--- | :--- | :--- |
| `src/health/health.controller.ts:9-16` | Returns hardcoded `{ status: 'ok' }` without checking if PostgreSQL or Redis are reachable. | Inject `DataSource` (`await this.dataSource.query('SELECT 1')`) and `RedisService` (`ping()`) to report real dependency health status. |

---

### 2.9 Inventory (`src/inventory/`)

| File & Lines | Clean Code / Bug Finding | How to Fix |
| :--- | :--- | :--- |
| `src/inventory/inventory.service.ts:43-50` | **Broken Stock Adjustment Logic:** `adjustInventory()` accepts `dto.type` (`StockMovementType` has 5 values: `IN`, `OUT`, `RESERVE`, `RELEASE`, `ADJUSTMENT`), but only handles `IN`/`ADJUSTMENT` and `OUT`. Worse, `dto.quantity` has no `@Min(1)` validation, so passing `type: OUT, quantity: -10` **adds** 10 to inventory (`-= -10`), and passing `type: ADJUSTMENT, quantity: -999` drives `available_quantity` negative without hitting the `OUT` check! | Restrict manual admin adjustment DTO to valid adjustment operations, enforce `available_quantity + delta >= 0` across **all** movement types, and throw `BadRequestException` whenever resulting stock would be negative. |
| `src/inventory/inventory.service.ts:130-156` | `deductInventory()` is dead code (never called when an order is paid), and does not record a `StockMovement` row (`StockMovementType.OUT`) when deducting reserved stock. | Call `deductInventory()` when an order transitions to `PAID` and insert a `StockMovement` audit record. |

---

### 2.10 Notifications (`src/notifications/`)

| File & Lines | Clean Code / Bug Finding | How to Fix |
| :--- | :--- | :--- |
| `src/notifications/notifications.service.ts:33-46` | `handleOrderPaid` hardcodes `user_id: '00000000-0000-0000-0000-000000000000'` because `PaymentsService` omitted `userId` from the `'order.paid'` event payload. | Include `userId: order.user_id` in the `'order.paid'` event payload emitted in `PaymentsService` (or `OrdersService`) and persist `payload.userId` in `handleOrderPaid`. |
| `src/notifications/notifications.service.ts:49-80` | `processOutbox()` has an unused `private isProcessing = false;` field (`line 11`) that is never read or updated! If a batch takes >10 seconds, overlapping cron executions send duplicate emails. | Check `if (this.isProcessing) return;` at the start of `processOutbox()`, set `this.isProcessing = true` inside a `try / finally { this.isProcessing = false; }` block. |

---

### 2.11 Orders, Payments & Shipping (`src/orders/`, `src/payments/`, `src/shipping/`)

| File & Lines | Clean Code / Bug Finding | How to Fix |
| :--- | :--- | :--- |
| `src/orders/orders.service.ts:79-118` | 1. Checks idempotency **after** reserving inventory (`line 63` vs `line 79`).<br>2. Never increments `cart.coupon.times_used` when a coupon is used on checkout.<br>3. `orders.controller.spec.ts` is broken (unmocked `OrdersService`). | 1. Check `IdempotencyKey` **before** reserving stock.<br>2. Increment `coupon.times_used` atomically inside the checkout transaction.<br>3. Fix `orders.controller.spec.ts`. |
| `src/payments/payments.service.ts:25, 68-89` | 1. Destructures `const { event_id, event_type, data } = payload; const { order_id, payment_id, amount } = data;` without null checks—throws unhandled `TypeError` (`500`) if `data` is undefined.<br>2. Never calls `inventoryService.deductInventory()` on `payment.succeeded` or `inventoryService.releaseInventory()` on `payment.failed`.<br>3. Overwrites `order.status` to `CANCELLED` even if `order.status === OrderStatus.PAID`. | 1. Validate webhook payload with a strict DTO.<br>2. Guard order state transitions.<br>3. Invoke `deductInventory` on payment capture and `releaseInventory` on payment failure. |
| `src/shipping/shipping.service.ts:15-52` | `dispatchShipment()` sets `shipment.status = DISPATCHED` and `markDelivered()` sets `shipment.status = DELIVERED`, but neither updates the parent `Order.status` (`OrderStatus.SHIPPED` / `OrderStatus.DELIVERED` are never used anywhere in the codebase!). | Load the associated `Order` (with relations) in `dispatchShipment()` and `markDelivered()` and update `order.status = OrderStatus.SHIPPED` and `OrderStatus.DELIVERED` respectively inside a transaction. |
| `src/redis/redis.module.ts` & `package.json` | Duplicate Redis dependencies: `ioredis` is used in `RedisModule`, while `cache-manager-redis-yet` (which brings in `redis` v4) is unused in `src/`. | Standardize on a single caching/Redis strategy and remove unused dependencies. |
