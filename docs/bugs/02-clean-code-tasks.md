# 02 — Clean Code Refactoring Tasks Checklist

> **Objective:** Module-by-module actionable tasks (`[x]`) with exact file paths and line numbers to eliminate all Clean Code defects, runtime bugs, dead code, and broken unit tests (`npm test`).

---

## 1. Root & Common Infrastructure (`src/main.ts`, `src/app.module.ts`, `src/common/`)

- [x] **1.1 Fix Hardcoded Port in `src/main.ts`**
  - [x] Retrieve `ConfigService` via `const configService = app.get(ConfigService);` and pass `configService.get<number>('PORT', 3000)` to `await app.listen(port)`.
- [x] **1.2 Fix Production Crash in `LoggerModule` (`src/app.module.ts`)**
  - [x] Convert `LoggerModule.forRoot(...)` to `LoggerModule.forRootAsync(...)` injecting `ConfigService`, and enable `pino-pretty` only when `NODE_ENV !== 'production'`.
- [x] **1.3 Improve Error Serialization & Logging in `src/common/filters/all-exceptions.filter.ts`**
  - [x] Replace `as any` with a typed `HttpExceptionResponseBody` interface and preserve the full validation errors array (`details`).
  - [x] Log non-`Error` unknown exceptions so no 500 error is silent.

---

## 2. Authentication, RBAC & Users (`src/auth/`, `src/users/`, `src/database/seeds/`)

- [x] **2.1 Fix `req.user.id` vs `payload.sub` Mismatch Across All Controllers**
  - [x] Normalize `request['user'] = { ...payload, sub: payload.sub ?? payload.id, id: payload.id ?? payload.sub }` in `JwtAuthGuard`.
  - [x] Update `src/auth/decorators/current-user.decorator.ts` to accept an optional field key (`data?: keyof TokenPayload`).
  - [x] Use `@CurrentUser('sub') userId: string` across `AuthController`, `CartController`, `OrdersController`, and `ReviewsController`.
- [x] **2.2 Unify Permission Constants Between Seed & Controllers**
  - [x] Create `src/common/constants/permissions.enum.ts` defining canonical and controller permissions.
  - [x] Update `src/database/seeds/initial-seed.ts` and `PermissionsGuard` to support all canonical and controller permissions.
- [x] **2.3 Clean Up `AuthService` (`src/auth/auth.service.ts`)**
  - [x] Remove `as any` casts by using `parseDurationToSeconds(raw: string): number` supporting `d`, `h`, `m`, and `s` suffixes.
  - [x] Make user creation + `CUSTOMER` role assignment transactional in `UsersService.createCustomerUser()`.

---

## 3. Catalog, Cart, Coupons & Inventory (`src/catalog/`, `src/cart/`, `src/coupons/`, `src/inventory/`)

- [x] **3.1 Fix Static Cache Key Collision in `src/catalog/products/products.controller.ts`**
  - [x] Remove `@CacheKey('catalog_products')` from `ProductsController.findAll` so `CacheInterceptor` caches per unique request URL & query parameters.
  - [x] Make `ProductsService.create()` transactional so `Product` and `Inventory` rows are created atomically.
  - [x] Add parent existence check and self-parenting/cycle check in `CategoriesService.create()` and `CategoriesService.update()`.
- [x] **3.2 Optimize `CartService` (`src/cart/cart.service.ts`)**
  - [x] Extract `private getOrCreateCartEntity(userId: string): Promise<Cart>` so mutations do not run `pricingService.calculateTotal()` twice per request.
- [x] **3.3 Fix Inventory Adjustment Logic (`src/inventory/inventory.service.ts`)**
  - [x] Reject `RESERVE` and `RELEASE` in manual adjustments and verify that resulting `available_quantity >= 0` for all adjustment types via `Inventory.adjust()`.

---

## 4. Orders, Payments, Shipping, Notifications, Audit & Health

- [x] **4.1 Fix Coupon Redemption on Checkout (`src/orders/orders.service.ts`)**
  - [x] Increment `Coupon.times_used` inside the checkout transaction when `cart.coupon_id` is present (`couponsService.redeemCoupon()`).
- [x] **4.2 Fix Payment Webhook State Machine & Inventory Calls (`src/payments/payments.service.ts`)**
  - [x] Guard against missing `payload?.data` before destructuring.
  - [x] Call `inventoryService.deductInventory(orderId)` on `payment.succeeded` and `inventoryService.releaseInventory(orderId)` on `payment.failed` via `OrdersService`.
  - [x] Prevent out-of-order `payment.failed` webhooks from overwriting `PAID`, `SHIPPED`, or `DELIVERED` orders.
  - [x] Include `userId: order.user_id` in the `'order.paid'` event payload.
- [x] **4.3 Fix Notification Outbox Concurrency (`src/notifications/notifications.service.ts`)**
  - [x] Use the `this.isProcessing` lock in `processPendingNotifications()` to prevent overlapping cron executions.
- [x] **4.4 Synchronize Shipment Status with Order Status (`src/shipping/shipping.service.ts`)**
  - [x] Update parent `Order.status` to `OrderStatus.SHIPPED` in `dispatchShipment()` and `OrderStatus.DELIVERED` in `markDelivered()`.
- [x] **4.5 Wire `AuditService` & Upgrade `HealthController`**
  - [x] Replace `any` in `src/audit/audit.service.ts` with `Record<string, unknown>` and record audit logs on order lifecycle events.
  - [x] Update `src/health/health.controller.ts` to check PostgreSQL (`SELECT 1`) and cache status.

---

## 5. Fix All Broken Unit Tests (`npm test`)

- [x] **5.1 Fix `src/cart/cart.controller.spec.ts`**
- [x] **5.2 Fix `src/cart/cart.service.spec.ts`**
- [x] **5.3 Fix `src/coupons/coupons.controller.spec.ts`**
- [x] **5.4 Fix `src/orders/orders.controller.spec.ts`**
- [x] **5.5 Verify Full Test Suite Green**
