# 03 — Security Audit & Hardening Plan

> **Scope:** End-to-end application security audit of `src/` (Authentication, Authorization/RBAC, Payment Webhook Integrity, Input Validation, HTTP Security Headers, Rate Limiting, Secrets Management, and Audit Trail), ranked by severity (`CRITICAL` $\rightarrow$ `HIGH` $\rightarrow$ `MEDIUM` $\rightarrow$ `LOW`).

---

## 1. Executive Security Summary

| ID | Severity | Vulnerability | Location | Impact |
| :--- | :---: | :--- | :--- | :--- |
| **SEC-01** | **CRITICAL** | Unauthenticated, unsigned Payment Webhook (`@Body() payload: any`) with no HMAC verification and no payment amount check | `src/payments/payments.controller.ts:12`, `src/payments/payments.service.ts:24-90` | Any anonymous attacker can mark any order as `PAID` for \$0.00 by sending a single `POST /api/v1/payments/webhook` request. |
| **SEC-02** | **CRITICAL** | `refreshTokens()` never cryptographically verifies `refreshToken` signature or expiration via `jwtService.verifyAsync()` | `src/auth/auth.service.ts:57-65` | Relies solely on string equality in Redis; does not verify JWT signature/claims with `JWT_REFRESH_SECRET` and accepts unvalidated raw body input. |
| **SEC-03** | **HIGH** | Multiple endpoints bypass `ValidationPipe` via inline TypeScript types or raw `@Body()` primitives | `reviews.controller.ts:28`, `shipping.controller.ts:24`, `cart.controller.ts:47`, `auth.controller.ts:26` | Allows arbitrary ratings (`rating: 999999` or `-500`), negative cart quantities, and malformed payloads to reach the database. |
| **SEC-04** | **HIGH** | Missing `helmet`, CORS restriction, and Rate Limiting (`@nestjs/throttler`) | `src/main.ts`, `src/app.module.ts` | Exposes `/api/v1/auth/login` and `/api/v1/auth/register` to unlimited brute-force credential stuffing and lacks HTTP security headers. |
| **SEC-05** | **HIGH** | Missing `Joi` schema validation for `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET` and fallback to empty secret `''` in `JwtAuthGuard` | `src/app.module.ts:34-41`, `src/auth/guards/jwt-auth.guard.ts:25` | If `JWT_ACCESS_SECRET` is unset in `.env`, `JwtAuthGuard` verifies tokens using an empty string `''` secret! |
| **SEC-06** | **MEDIUM** | Missing `ParseUUIDPipe` on route parameters across controllers | `products`, `categories`, `cart`, `orders`, `reviews`, `shipping` controllers | Passing non-UUID strings (e.g., `/api/v1/orders/not-a-uuid`) hits PostgreSQL `uuid` columns directly and triggers unhandled `500 Internal Server Error` (`22P02`). |
| **SEC-07** | **MEDIUM** | Broken RBAC permission enforcement & role-vs-permission confusion | `initial-seed.ts`, `shipping.controller.ts:21,29`, `inventory.controller.ts:21` | `STAFF` users cannot perform seeded duties because controller `@Permissions()` names do not match seeded permission names; `ShippingController` checks `@Permissions('ADMIN')` (a role name, not a permission). |
| **SEC-08** | **MEDIUM** | Access tokens remain valid after `/auth/logout` + zero security audit logging | `src/auth/auth.service.ts:38`, `src/audit/audit.service.ts` | Logged-out access tokens cannot be revoked before expiry; sensitive actions leave zero records in `audit_logs`. |
| **SEC-09** | **LOW** | Swagger UI (`/api/docs`) exposed unconditionally in production + hardcoded DB fallback credentials | `src/main.ts:35`, `src/database/data-source.ts:11` | Exposes full internal API surface in production and embeds default credentials in source code. |

---

## 2. Detailed Vulnerability Analysis & Remediation Code

### 2.1 [CRITICAL] SEC-01: Unauthenticated & Unverified Payment Webhook (`src/payments/`)

#### Vulnerability Details
In `src/payments/payments.controller.ts:12-15`:
```typescript
@Post('webhook')
@HttpCode(HttpStatus.OK)
processWebhook(@Body() payload: any) {
  return this.paymentsService.processWebhook(payload);
}
```
1. **No Signature Verification:** There is no `x-Payment-Signature` / HMAC-SHA256 verification. Anyone on the internet who knows or guesses an `order_id` can POST `{ "event_id": "1", "event_type": "payment.succeeded", "data": { "order_id": "<uuid>", "payment_id": "fake", "amount": 0.01 } }` and transition the order to `PAID`.
2. **No Amount Verification (`src/payments/payments.service.ts:68-72`):** Even for a real webhook, `PaymentsService` never checks whether `Number(data.amount) === Number(order.total_amount)`.
3. **No DTO Validation (`payload: any`):** Because `payload` is typed as `any`, NestJS `ValidationPipe` cannot validate it.

#### Remediation
1. Require `PAYMENT_WEBHOOK_SECRET` in `ConfigModule` Joi validation (`src/app.module.ts`).
2. Create `PaymentWebhookDto` (`src/payments/dto/payment-webhook.dto.ts`) with `@IsString()`, `@IsIn(['payment.succeeded', 'payment.failed'])`, `@ValidateNested()` for `data` (`order_id`, `payment_id`, `amount`).
3. Verify HMAC-SHA256 signature from header `x-webhook-signature` using `crypto.timingSafeEqual`:
   ```typescript
   // src/payments/guards/webhook-signature.guard.ts
   const expectedSig = crypto
     .createHmac('sha256', webhookSecret)
     .update(JSON.stringify(request.body))
     .digest('hex');
   if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
     throw new UnauthorizedException('Invalid payment webhook signature');
   }
   ```
4. Verify in `PaymentsService.processWebhook()` that `Math.abs(Number(data.amount) - Number(order.total_amount)) < 0.01`.

---

### 2.2 [CRITICAL] SEC-02: Unverified Refresh Token in `AuthService.refreshTokens()` (`src/auth/`)

#### Vulnerability Details
In `src/auth/auth.controller.ts:24-30` and `src/auth/auth.service.ts:57-65`:
```typescript
async refreshTokens(userId: string, refreshToken: string) {
  const storedToken = await this.redisService.get(`refresh_token:${userId}`);
  if (!storedToken || storedToken !== refreshToken) {
    throw new UnauthorizedException('Invalid or expired refresh token');
  }
  const user = await this.usersService.findById(userId);
  ...
```
1. `AuthService.refreshTokens` never calls `this.jwtService.verifyAsync(refreshToken, { secret: refreshSecret })`!
2. Furthermore, if a user is `SUSPENDED` (`user.status !== UserStatus.ACTIVE`), `refreshTokens()` still issues new access and refresh tokens (`line 64` only checks `if (!user)`).

#### Remediation
1. Create `RefreshTokenDto` (`src/auth/dto/refresh-token.dto.ts`) with `@IsUUID() userId` and `@IsString() @IsNotEmpty() refreshToken`.
2. In `AuthService.refreshTokens()`, verify the JWT signature and `sub` claim with `JWT_REFRESH_SECRET` and verify `user.status === UserStatus.ACTIVE`:
   ```typescript
   const payload = await this.jwtService.verifyAsync< { sub: string } >(refreshToken, {
     secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
   });
   if (payload.sub !== userId) {
     throw new UnauthorizedException('Refresh token subject mismatch');
   }
   ```

---

### 2.3 [HIGH] SEC-03: Endpoints Bypassing `ValidationPipe` (`src/reviews/`, `src/shipping/`, `src/cart/`, `src/coupons/`)

#### Vulnerability Details
`ValidationPipe` in NestJS only validates parameters typed with a **class** decorated with `class-validator` decorators. TypeScript interfaces or inline object types are erased at compile time:
- **`src/reviews/reviews.controller.ts:28`**: `@Body() body: { rating: number; comment?: string }` is an inline TypeScript type (erased to `Object` at runtime). `ValidationPipe` does **zero** validation! An attacker can submit `{ "rating": 999999 }` or `{ "rating": -100, "extra": "malicious" }`.
- **`src/shipping/shipping.controller.ts:24-25`**: `@Body('carrier') carrier: string, @Body('trackingNumber') trackingNumber: string` bypasses class validation completely.
- **`src/cart/cart.controller.ts:47`**: `@Body('quantity') quantity: number` bypasses class validation—an attacker can pass `"quantity": -5` or `"quantity": "NaN"`.
- **`src/coupons/dto/create-coupon.dto.ts:14-16`**: `@Min(0) discount_value: number` allows creating a `PERCENTAGE` coupon with `discount_value: 5000` (5000% off!).

#### Remediation
- Create `CreateReviewDto` (`@IsInt() @Min(1) @Max(5) rating: number; @IsOptional() @IsString() @MaxLength(2000) comment?: string;`).
- Create `DispatchShipmentDto` (`@IsString() @IsNotEmpty() @MaxLength(100) carrier: string; @IsString() @IsNotEmpty() @MaxLength(100) trackingNumber: string;`).
- Create `UpdateCartItemDto` (`@IsInt() @Min(0) @Max(1000) quantity: number;`).
- Add custom validation on `CreateCouponDto` so when `discount_type === DiscountType.PERCENTAGE`, `discount_value <= 100`.

---

### 2.4 [HIGH] SEC-04 & SEC-05: Missing HTTP Hardening (`helmet`, CORS, Throttler) & Secret Validation

#### Vulnerability Details
1. `src/main.ts` does not register `helmet()`, does not configure `app.enableCors(...)`, and has no rate limiting on authentication or checkout routes.
2. `src/app.module.ts:34-41` validates `DATABASE_URL` and `REDIS_URL`, but **does not validate** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, or `PAYMENT_WEBHOOK_SECRET`.
3. `src/auth/guards/jwt-auth.guard.ts:25` falls back to an empty string secret:
   ```typescript
   secret: this.configService.get<string>('JWT_ACCESS_SECRET') || '',
   ```

#### Remediation
1. Add `JWT_ACCESS_SECRET: Joi.string().min(16).required()`, `JWT_REFRESH_SECRET: Joi.string().min(16).required()`, and `PAYMENT_WEBHOOK_SECRET: Joi.string().min(16).required()` to `ConfigModule.forRoot({ validationSchema })` in `src/app.module.ts`.
2. In `JwtAuthGuard` (`src/auth/guards/jwt-auth.guard.ts:25`), use `this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')`.
3. Configure security headers and CORS in `src/main.ts` and rate limiting on `/auth/login` and `/auth/register`.

---

### 2.5 [MEDIUM] SEC-06, SEC-07, SEC-08 & [LOW] SEC-09

1. **SEC-06 (`ParseUUIDPipe`)**: Add `@Param('id', ParseUUIDPipe)` (and `@Param('productId', ParseUUIDPipe)`, `@Param('orderId', ParseUUIDPipe)`) to all UUID route parameters in `ProductsController`, `CategoriesController`, `CartController`, `OrdersController`, `ReviewsController`, and `ShippingController`.
2. **SEC-07 (RBAC Alignment)**: Align `initial-seed.ts` permissions with controller `@Permissions()` decorators and fix `ShippingController` (`@Permissions('shipping.manage')` instead of `@Permissions('ADMIN')`).
3. **SEC-08 (Audit Logging)**: Record security and financial events (`auth.login`, `order.checkout`, `payment.webhook`, `inventory.adjust`, `shipping.dispatch`) via `AuditService.logAction()`.
4. **SEC-09 (Swagger & Secrets Hygiene)**: Gate `SwaggerModule.setup('api/docs', ...)` in `src/main.ts:35` behind `configService.get('NODE_ENV') !== 'production'`.
