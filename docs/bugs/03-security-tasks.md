# 03 — Security Hardening Tasks Checklist

> **Objective:** Ordered, actionable security tasks (`[x]`) grouped by severity (`CRITICAL` $\rightarrow$ `HIGH` $\rightarrow$ `MEDIUM` $\rightarrow$ `LOW`) to remediate every vulnerability identified in `03-security-plan.md`.

---

## Priority 1: Critical Severity Tasks (`CRITICAL`)

- [x] **1.1 Secure `POST /api/v1/payments/webhook` (`src/payments/`)**
  - [x] Create `src/payments/dto/payment-webhook.dto.ts` validating `event_id`, `type` / `event_type`, and nested `data` (`order_id`, `amount`).
  - [x] Implement HMAC-SHA256 signature verification (`verifyWebhookSignature`) using `crypto.createHmac('sha256', secret)` and `crypto.timingSafeEqual`.
  - [x] Verify in `OrdersService.confirmOrderPayment()` that `Number(amount) === Number(order.total_amount)` before marking an order as `PAID`.

- [x] **1.2 Harden `POST /api/v1/auth/refresh` & Token Verification (`src/auth/`)**
  - [x] Create `src/auth/dto/refresh-token.dto.ts` validating `user_id`/`userId` (`@IsUUID()`) and `refresh_token`/`refreshToken` (`@IsString()`).
  - [x] Cryptographically verify `refreshToken` using `jwtService.verifyAsync(refreshToken, { secret: JWT_REFRESH_SECRET })`, verify `sub === userId`, and reject inactive/disabled users.

---

## Priority 2: High Severity Tasks (`HIGH`)

- [x] **2.1 Eliminate All `ValidationPipe` Bypasses Across Controllers**
  - [x] **Reviews (`src/reviews/`)**: Create `src/reviews/dto/create-review.dto.ts` (`@IsUUID() product_id`, `@IsInt() @Min(1) @Max(5) rating`, `@IsString() @IsNotEmpty() @MaxLength(2000) comment`) and use it in `ReviewsController.createReview()`.
  - [x] **Shipping (`src/shipping/`)**: Create `src/shipping/dto/dispatch-shipment.dto.ts` and use it in `ShippingController.dispatchShipment()`.
  - [x] **Cart (`src/cart/`)**: Create `src/cart/dto/update-cart-item.dto.ts` (`@IsInt() @Min(1) quantity`) and use it in `CartController.updateItemQuantity()`.
  - [x] **Coupons (`src/coupons/`)**: Add `@ValidateIf((o) => o.discount_type === 'PERCENTAGE') @Max(100)` to `CreateCouponDto` and enforce `<= 100` in `CouponsService`.

- [x] **2.2 Enforce Environment Secret Validation & Remove Empty Secret Fallback**
  - [x] Add `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION`, and `PAYMENT_WEBHOOK_SECRET` to `ConfigModule` Joi schema in `src/app.module.ts`.
  - [x] Remove empty string `''` fallback in `JwtAuthGuard`.

- [x] **2.3 Add HTTP Security Headers & CORS (`src/main.ts`)**
  - [x] Configure `app.enableCors()` and security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`) in `src/main.ts`.

---

## Priority 3: Medium Severity Tasks (`MEDIUM`)

- [x] **3.1 Add `ParseUUIDPipe` to All UUID Route Parameters**
  - [x] `src/catalog/products/products.controller.ts`
  - [x] `src/catalog/categories/categories.controller.ts`
  - [x] `src/cart/cart.controller.ts`
  - [x] `src/coupons/coupons.controller.ts`
  - [x] `src/inventory/inventory.controller.ts`
  - [x] `src/reviews/reviews.controller.ts`
  - [x] `src/shipping/shipping.controller.ts`

- [x] **3.2 Fix RBAC Permission Mismatches & Role Checks**
  - [x] Align permission strings between `src/database/seeds/initial-seed.ts`, `PermissionsGuard`, and controller `@Permissions()` decorators.

- [x] **3.3 Implement Active Security & Financial Audit Trail**
  - [x] Wire `AuditService` event listeners to log `ORDER_PLACED`, `ORDER_PAID`, and `ORDER_CANCELLED`.

---

## Priority 4: Low Severity Tasks (`LOW`)

- [x] **4.1 Restrict Swagger UI in Production (`src/main.ts`)**
  - [x] Only mount `SwaggerModule.setup('api/docs', app, document)` when `configService.get('NODE_ENV') !== 'production'`.
- [x] **4.2 Clean Up Database Configuration (`src/database/data-source.ts`)**
  - [x] Configure `.env.example` and `src/database/data-source.ts` cleanly.
