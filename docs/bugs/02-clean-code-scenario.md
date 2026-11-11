# 02 — Clean Code Bug Reproduction & Verification Scenarios

> **Purpose:** Step-by-step reproduction of the major Clean Code & functional defects discovered in `src/`, paired with expected behavior and verification tests after remediation.

---

## Scenario 1: Authenticated User Cart & Checkout Crash (`req.user.id` vs `payload.sub`)

### 1.1 Bug Reproduction Today
1. A customer logs in via `POST /api/v1/auth/login`.
2. `AuthService.generateTokens()` (`src/auth/auth.service.ts:68-73`) creates a JWT with payload:
   ```json
   {
     "sub": "8a4f2d10-1234-4b5c-9abc-111122223333",
     "email": "customer@example.com",
     "roles": ["CUSTOMER"],
     "permissions": []
   }
   ```
3. The customer sends `GET /api/v1/cart` with `Authorization: Bearer <accessToken>`.
4. `JwtAuthGuard.canActivate()` (`src/auth/guards/jwt-auth.guard.ts:27`) assigns `request['user'] = payload`.
5. `CartController.getCart(@Request() req)` (`src/cart/cart.controller.ts:20`) executes:
   ```typescript
   return this.cartService.getCartAndPricing(req.user.id);
   ```
6. Because `payload` has `sub` and **not** `id`, `req.user.id` is `undefined`!
7. `CartService.getCartAndPricing(undefined)` creates a new `Cart` with `user_id: undefined` (`NULL` in PostgreSQL `carts.user_id` column, throwing a `23502 not-null constraint` error!).

### 1.2 Clean Code Fix & Verification
- Normalize `request['user'] = { ...payload, id: payload.sub }` in `JwtAuthGuard` and use `@CurrentUser('sub') userId: string` across all controller methods.
- **Verification Test:**
  ```typescript
  it('passes the authenticated user UUID from JWT sub claim to CartService', async () => {
    const mockUser: TokenPayload = {
      sub: '8a4f2d10-1234-4b5c-9abc-111122223333',
      email: 'customer@example.com',
      roles: ['CUSTOMER'],
      permissions: [],
    };
    await controller.getCart(mockUser.sub);
    expect(cartService.getCartAndPricing).toHaveBeenCalledWith('8a4f2d10-1234-4b5c-9abc-111122223333');
  });
  ```

---

## Scenario 2: Catalog Pagination & Search Returning Stale Cached Page 1 (`@CacheKey('catalog_products')`)

### 2.1 Bug Reproduction Today
1. User A requests `GET /api/v1/products?page=1&limit=2`.
   - `ProductsController.findAll()` (`src/catalog/products.controller.ts:41-43`) has `@UseInterceptors(CacheInterceptor)` and `@CacheKey('catalog_products')`.
   - NestJS caches the response for `?page=1&limit=2` under the static key `'catalog_products'`.
2. Two seconds later, User B requests `GET /api/v1/products?page=2&limit=2&search=keyboard`.
   - Because `@CacheKey('catalog_products')` overrides dynamic URL keying, `CacheInterceptor` looks up `'catalog_products'` and immediately returns User A's `page=1&limit=2` response!
3. An admin creates a new product via `POST /api/v1/products`.
   - `GET /api/v1/products` continues serving the stale list for up to 60 seconds.

### 2.2 Clean Code Fix & Verification
- Remove `@CacheKey('catalog_products')` from `src/catalog/products.controller.ts:42` so `CacheInterceptor` keys by the full request path + query parameters (`/api/v1/products?page=2&limit=2&search=keyboard`).
- **Verification:**
  - Request `GET /api/v1/products?page=1&limit=1` $\rightarrow$ returns `meta.page === 1`.
  - Immediately request `GET /api/v1/products?page=2&limit=1` $\rightarrow$ returns `meta.page === 2` with the second product.

---

## Scenario 3: Payment Failure Leaking Reserved Inventory & Coupon Usage Never Incrementing

### 3.1 Bug Reproduction Today
1. Product P1 starts with `available_quantity = 5, reserved_quantity = 0`.
2. Coupon `SAVE20` has `usage_limit = 1, times_used = 0`.
3. Customer applies `SAVE20` to their cart and checks out 5 units of P1 via `POST /api/v1/orders/checkout`.
   - `Inventory` is updated to `available_quantity = 0, reserved_quantity = 5`.
   - **Defect A:** `SAVE20.times_used` remains `0` (`OrdersService.checkout` never increments `times_used`), allowing unlimited users to redeem a single-use coupon!
4. Payment fails and the gateway sends `POST /api/v1/payments/webhook` with `event_type: 'payment.failed'`.
   - `PaymentsService.processWebhook()` (`src/payments/payments.service.ts:73-77`) sets `order.status = OrderStatus.CANCELLED`.
   - **Defect B:** `InventoryService.releaseInventory()` is never called! Product P1 stays at `available_quantity = 0, reserved_quantity = 5` forever—no other customer can ever buy P1.

### 3.2 Clean Code Fix & Verification
- In `OrdersService.checkout()`, atomically increment `coupon.times_used += 1` inside the checkout transaction.
- In `PaymentsService.processWebhook()`:
  - When `payment.failed` transitions a `PENDING` order to `CANCELLED`, call `inventoryService.releaseInventory(orderItems)` so `available_quantity` returns to `5` and `reserved_quantity` returns to `0`.
  - When `payment.succeeded` transitions a `PENDING` order to `PAID`, call `inventoryService.deductInventory(orderItems)` so `reserved_quantity` decrements from `5` to `0`.

---

## Scenario 4: Shipment Dispatched & Delivered Leaving Order Stuck in `PAID`

### 4.1 Bug Reproduction Today
1. Order `ord-1` is paid (`order.status = 'PAID'`).
2. Staff calls `POST /api/v1/shipping/ord-1/dispatch` with `{ carrier: 'FedEx', trackingNumber: 'FX123' }`.
   - `ShippingService.dispatchShipment()` (`src/shipping/shipping.service.ts:15-34`) creates a `Shipment` row with `status = 'DISPATCHED'`.
   - Customer checks `GET /api/v1/orders/ord-1` $\rightarrow$ `order.status` is still `'PAID'`!
3. Staff calls `PATCH /api/v1/shipping/<shipmentId>/deliver`.
   - `ShippingService.markDelivered()` (`src/shipping/shipping.service.ts:36-52`) updates `shipment.status = 'DELIVERED'`.
   - Customer checks `GET /api/v1/orders/ord-1` $\rightarrow$ `order.status` is **still** `'PAID'`! (`OrderStatus.SHIPPED` and `OrderStatus.DELIVERED` are never assigned anywhere in `src/`).

### 4.2 Clean Code Fix & Verification
- Update `ShippingService.dispatchShipment()` to transition the parent `Order.status` to `OrderStatus.SHIPPED`.
- Update `ShippingService.markDelivered()` to transition the parent `Order.status` to `OrderStatus.DELIVERED`.

---

## Scenario 5: Running `npm test` on Unmocked Spec Boilerplate

### 5.1 Bug Reproduction Today
Running `npx jest` in the repository today fails on 4 out of 8 test suites:
- `FAIL src/cart/cart.controller.spec.ts` (`Nest can't resolve dependencies of the CartController (?). Please make sure that the argument CartService at index [0] is available`)
- `FAIL src/cart/cart.service.spec.ts` (`Nest can't resolve dependencies of the CartService (?). Please make sure that the argument CartRepository at index [0] is available`)
- `FAIL src/coupons/coupons.controller.spec.ts` (`Nest can't resolve dependencies of the CouponsController (?)`)
- `FAIL src/orders/orders.controller.spec.ts` (`Nest can't resolve dependencies of the OrdersController (?)`)

### 5.2 Clean Code Fix & Verification
- Provide proper unit test mocks in all 4 spec files and add unit tests for `PricingService`, `CartService`, `OrdersService`, `PaymentsService`, and `InventoryService`.
- **Verification Command:**
  ```powershell
  npm test
  # Expected: Test Suites: 8 passed, 8 total
  ```
