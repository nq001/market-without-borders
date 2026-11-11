# 03 — Security Attack & Defense Verification Scenarios

> **Purpose:** Concrete exploit scenarios demonstrating how the current vulnerabilities in `src/` can be abused today, followed by the exact defense verification tests once the security hardening tasks are applied.

---

## Scenario 1: Forged Payment Webhook Attack (Paying \$0.01 for a \$2,500 Order)

### 1.1 Attack Walkthrough (Exploitable Today)
1. Attacker places a legitimate checkout order (`POST /api/v1/orders/checkout`) for a \$2,500 laptop and receives `order.id = "c4b1...9901"` in `PENDING` status.
2. Instead of paying via a payment gateway, the attacker sends an unauthenticated request directly to the public webhook endpoint:
   ```http
   POST /api/v1/payments/webhook HTTP/1.1
   Content-Type: application/json

   {
     "event_id": "forged_evt_999",
     "event_type": "payment.succeeded",
     "data": {
       "order_id": "c4b1...9901",
       "payment_id": "fake_pay_001",
       "amount": 0.01
     }
   }
   ```
3. **Current Result in `src/payments/payments.controller.ts:12` & `payments.service.ts:68`:**
   - No signature header is checked.
   - `data.amount` (`0.01`) is never compared against `order.total_amount` (`2500.00`).
   - `order.status` is immediately updated to `PAID` and the server responds `200 OK { "status": "processed" }`!

### 1.2 Defense Verification (After Hardening)
1. **Unsigned / Invalid HMAC Request:**
   - Attacker sends the same POST without a valid `x-webhook-signature` header.
   - `PaymentWebhookSignatureGuard` rejects the request with `401 Unauthorized`.
2. **Signed Request with Tampered Amount (`amount: 0.01` vs `order.total_amount: 2500.00`):**
   - `PaymentsService.processWebhook()` compares `Number(payload.data.amount)` against `Number(order.total_amount)`, aborts the transaction, and throws `400 Bad Request ("Payment amount mismatch")`.

---

## Scenario 2: Inline Type `ValidationPipe` Bypass on Product Reviews & Cart

### 2.1 Attack Walkthrough (Exploitable Today)
1. In `src/reviews/reviews.controller.ts:28`, the body parameter is declared as an inline TypeScript type:
   ```typescript
   @Body() body: { rating: number; comment?: string }
   ```
2. Because TypeScript interfaces/inline types are erased at transpile time, `ValidationPipe` sees `metatype === Object` and skips validation and property whitelisting!
3. An attacker who bought a product sends:
   ```http
   POST /api/v1/products/d290f1ee-6c54-4b01-90e6-d701748f0851/reviews
   Authorization: Bearer <token>
   Content-Type: application/json

   {
     "rating": 9999999,
     "comment": " Manipulated average rating! "
   }
   ```
4. **Current Result:** PostgreSQL `reviews.rating` is a plain `integer` column (`src/database/entities/review.entity.ts:25`) with no DB check constraint and no DTO `@Min(1) @Max(5)`. The rating `9999999` is saved directly to the database, corrupting the product's rating calculation!

### 2.2 Defense Verification (After Hardening)
- With `CreateReviewDto` (`@IsInt() @Min(1) @Max(5) rating: number`), sending `"rating": 9999999` or `"rating": 0` is immediately rejected by `ValidationPipe` before hitting `ReviewsController`:
  ```json
  {
    "success": false,
    "error": {
      "code": 400,
      "message": "rating must not be greater than 5",
      "details": ["rating must not be greater than 5"]
    }
  }
  ```

---

## Scenario 3: Suspended User Refreshing Tokens & Forged Refresh Token Claims

### 3.1 Attack Walkthrough (Exploitable Today)
1. User `usr-bad` commits fraud and an administrator suspends their account (`UPDATE users SET status = 'SUSPENDED' WHERE id = 'usr-bad'`).
2. When `usr-bad` tries `POST /api/v1/auth/login`, `AuthService.validateUser()` (`src/auth/auth.service.ts:29`) blocks them because `user.status !== UserStatus.ACTIVE`.
3. However, `usr-bad` calls `POST /api/v1/auth/refresh` with `{ "userId": "usr-bad", "refreshToken": "<existing_refresh_token>" }`.
4. **Current Result in `src/auth/auth.service.ts:57-65`:**
   - `refreshTokens()` checks `if (!user)` (`line 64`), completely ignoring `user.status !== UserStatus.ACTIVE`!
   - Even worse, `refreshTokens()` never calls `jwtService.verifyAsync(refreshToken, { secret: JWT_REFRESH_SECRET })`.
   - `usr-bad` receives a brand-new `accessToken` and `refreshToken` for another 7 days despite being `SUSPENDED`!

### 3.2 Defense Verification (After Hardening)
- `AuthService.refreshTokens()` verifies the JWT cryptographic signature using `JWT_REFRESH_SECRET`, checks `user.status === UserStatus.ACTIVE`, deletes the Redis refresh token key if the user is suspended, and throws `401 Unauthorized`.

---

## Scenario 4: RBAC Permission Denial for Seeded `STAFF` Accounts & `@Permissions('ADMIN')` Misconfiguration

### 4.1 Bug & Security Misconfiguration Walkthrough Today
1. `src/database/seeds/initial-seed.ts:22-25` seeds two permissions for the `STAFF` role:
   - `'inventory.update'`
   - `'catalog.manage'`
2. However, the controllers check completely different strings:
   - `InventoryController.adjustInventory()` (`src/inventory/inventory.controller.ts:21`) requires `@Permissions('ADJUST_INVENTORY')`.
   - `ProductsController.create()` (`src/catalog/products.controller.ts:34`) requires `@Permissions('CREATE_PRODUCT')`.
   - `ShippingController.dispatchShipment()` (`src/shipping/shipping.controller.ts:21`) requires `@Permissions('ADMIN')`—passing a **Role** name to `@Permissions()`, which checks `user.permissions.includes('ADMIN')`!
3. **Current Result:**
   - Even an `ADMIN` user only passes `PermissionsGuard` because `initial-seed.ts` assigns thesame 2 permissions (`inventory.update`, `catalog.manage`) to `ADMIN`—Wait: in `PermissionsGuard` (`src/auth/guards/permissions.guard.ts:21-26`), `PermissionsGuard` does **not** bypass permission checks for `ADMIN` roles (`return requiredPermissions.some((permission) => user.permissions.includes(permission))`)!
   - Therefore, **neither `ADMIN` nor `STAFF` users created by `initial-seed.ts` can call `POST /api/v1/products`, `POST /api/v1/inventory/adjust`, or `POST /api/v1/shipping/:orderId/dispatch`!** Every single protected admin/staff endpoint returns `403 Forbidden` for the seeded `admin@commerce.local` account!

### 4.2 Defense & RBAC Verification (After Hardening)
1. Unify permission constants across `initial-seed.ts` and all `@Permissions()` decorators.
2. In `PermissionsGuard`, explicitly allow `user.roles?.includes('ADMIN')` OR matching `requiredPermissions.every((perm) => user.permissions?.includes(perm))`.
3. Verify with E2E tests:
   - `CUSTOMER` calling `POST /api/v1/inventory/adjust` $\rightarrow$ `403 Forbidden`.
   - `STAFF` calling `POST /api/v1/inventory/adjust` $\rightarrow$ `201 Created`.
   - `ADMIN` calling `POST /api/v1/shipping/:orderId/dispatch` $\rightarrow$ `201 Created`.
