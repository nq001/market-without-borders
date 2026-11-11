# Qubrax Commerce Platform: Full UI Screen Inventory (E2E)

Source: `nq001/commerce-order-management-platform` (NestJS modular monolith: auth, catalog, inventory, cart, coupons, orders, payments, shipping, reviews, notifications, audit).

**Total: 28 screens** = 14 customer + 11 admin + 3 system.
Status legend: **READY** = API supports it today. **NEEDS BACKEND** = endpoint missing or broken (see section 2).

---

## 1. How we will work (workflow)

1. You send me one screen ID at a time (for example `C02`).
2. I design that screen end to end (all states, mobile and desktop) in the agreed style.
3. You review it.
4. After approval I export it to an `.md` spec file you can download.
5. We move to the next screen.

---

## 2. API reality flags (they affect the UI)

| # | Finding | UI impact |
|---|---|---|
| 1 | No `GET /orders`, `GET /orders/:id`, or cancel endpoint | C07, C08, C09, A06 are blocked. Payment is confirmed only by webhook, so the UI cannot learn "PAID" without it |
| 2 | No profile or address endpoints (promised in scope doc) | C10, C11 blocked. Checkout address entry only |
| 3 | Product has no image field (sku, name, description, price, category, is_active) | Catalog must be typographic or `image_url` must be added |
| 4 | Cart is under JWT guard | Guests cannot add to cart. Needs a decision |
| 5 | Seed permissions (`catalog.manage`, `inventory.update`, `orders.view`) do not match controller permissions (`CREATE_PRODUCT`, `ADJUST_INVENTORY`, `VIEW_COUPON`, `APPROVE_REVIEW`, and so on) | Admin screens would return 403 even for an admin |
| 6 | Shipping controller imports `roles.guard` / `roles.decorator`, which I did not find in the repo | A07 blocked until fixed |
| 7 | Order statuses in code (`PENDING_PAYMENT`, `PAID`, `PAYMENT_FAILED`) differ from the docs state machine (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`, `RETURNED`) | Status labels must be agreed before designing |
| 8 | No list endpoints for reviews, notifications, audit logs, users, payments | See per-screen notes |
| 9 | No password reset or email verification endpoints | C14 blocked |
| 10 | Prices are integers in minor units; no currency field; no shipping or tax lines | Format `150000` as `1,500.00`; pricing is subtotal, discount, total only |

---

## 3. Customer storefront (14 screens)

### C01. Home / Landing: NEEDS DESIGN DECISION
- **Purpose:** first impression, entry to the catalog.
- **Data:** `GET /categories`, `GET /products` (featured or newest via `sort_by=created_at`).
- **Elements:** header (logo, search, cart, account), hero statement, category entry points, newest products, footer.
- **States:** loading, empty catalog, API error.

### C02. Catalog (browse, search, filter, sort, pagination): READY
- **Endpoint:** `GET /products` with `search`, `category_id`, `min_price`, `max_price`, `sort_by` (price, created_at, name), `order`, `page`, `limit`; `GET /categories`.
- **Elements:** search bar, category tree filter, price range, sort control, product rows or tiles, pagination.
- **States:** loading, no results, out of stock marker, error.

### C03. Product detail: READY (reviews list NEEDS BACKEND)
- **Endpoint:** `GET /products/:id`; `POST /cart/items`.
- **Elements:** name, description, price, category breadcrumb, stock state (from inventory), quantity selector, add to cart, reviews section.
- **States:** in stock, low stock, out of stock, inactive or deleted product, not logged in on add to cart.

### C04. Cart (slide-over or page): READY
- **Endpoint:** `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:productId`, `DELETE /cart/items/:productId`, `POST /cart/coupon`, `DELETE /cart/coupon`.
- **Elements:** line items, quantity stepper, remove, coupon field, subtotal / discount / total, checkout button.
- **States:** empty cart, invalid coupon, expired coupon, usage limit reached, item no longer available.

### C05. Login / Register: READY
- **Endpoint:** `POST /auth/register` (email, password min 8, first_name, last_name), `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.
- **Elements:** one screen with two modes, inline validation, password rules.
- **States:** wrong credentials, email already used, session expired.

### C06. Checkout: READY
- **Endpoint:** `POST /orders/checkout` (idempotency_key, full_name, phone, country, city, street, postal_code).
- **Elements:** 6 visible fields, order summary, total, place order. The client generates the idempotency key once per attempt and reuses it on retry.
- **States:** submitting, 409 stock conflict, 409 "already in progress", empty cart, validation errors.

### C07. Order result / payment status: NEEDS BACKEND (flag 1)
- **Needs:** `GET /orders/:id`.
- **Elements:** order number, status in plain language, items, total, address snapshot.
- **States:** processing payment, paid, payment failed (retry path), timeout.

### C08. My orders (list): NEEDS BACKEND (flag 1)
- **Needs:** `GET /orders` (own orders, paginated).
- **Elements:** order cards with date, total, status, quick link to detail.
- **States:** no orders yet, loading, error.

### C09. Order detail and tracking: NEEDS BACKEND (flag 1)
- **Needs:** `GET /orders/:id` with shipment and events; cancel and return endpoints.
- **Elements:** status timeline, items, address snapshot, shipment (provider, tracking number, events), cancel (eligible states only), return (shipped or delivered), review prompt after delivery.

### C10. Account / Profile: NEEDS BACKEND (flag 2)
- **Needs:** `GET/PATCH /users/me`.
- **Elements:** name, email, change password, logout.

### C11. Addresses: NEEDS BACKEND (flag 2)
- **Needs:** address CRUD (an `address.entity` already exists).
- **Elements:** saved address list, add, edit, delete, default; picker inside checkout.

### C12. Write a review: READY
- **Endpoint:** `POST /reviews` (product_id, rating, comment).
- **Elements:** star rating, comment, "pending approval" confirmation state. Reviews only show publicly after admin approval.

### C13. Notifications: NEEDS BACKEND (flag 8)
- **Needs:** `GET /notifications`, mark as read. Notification entity and ORDER_CONFIRMATION type exist.
- **Elements:** list, unread badge, empty state.

### C14. Password reset / email verification: NEEDS BACKEND (flag 9)
- **Elements:** forgot password, reset form, verify email result.

---

## 4. Admin console (11 screens)

Admin access depends on fixing flag 5 (permissions) first.

### A01. Dashboard: NEEDS BACKEND
- **Needs:** aggregate endpoints (sales, orders by status, low stock).
- **Elements:** key numbers, recent orders, low-stock alerts, failed payments.

### A02. Products and stock: READY (after flag 5)
- **Endpoint:** `GET/POST/PATCH/DELETE /products`, `PATCH /inventory/:productId/adjust`, `GET /inventory/:productId/movements`.
- **Elements:** product table with search and filters, create/edit drawer (sku, name, description, price, category, active), inventory adjust (quantity, movement type, reference), movement history.
- **Note:** new products start with inventory 0.

### A03. Categories: READY (after flag 5)
- **Endpoint:** `GET/POST/PATCH/DELETE /categories`.
- **Elements:** category tree with parent and child, create, rename, slug, delete guard.

### A04. Inventory overview: NEEDS BACKEND
- **Needs:** list inventory across products.
- **Elements:** low-stock list, reserved vs available, quick adjust.

### A05. Coupons: READY (after flag 5)
- **Endpoint:** `GET/POST/PATCH/DELETE /coupons`.
- **Elements:** coupon table, create/edit (code, PERCENTAGE or FIXED, amount, usage limit, expiry), usage count, expired badge.

### A06. Orders (list and detail): NEEDS BACKEND (flag 1)
- **Needs:** `GET /orders` (admin, filters), order detail, status transitions.
- **Elements:** filter by status and date, order detail with payment events, address snapshot, shipment, actions allowed by state machine.

### A07. Shipping fulfilment: NEEDS BACKEND (flags 1, 6)
- **Endpoint:** `PATCH /shipping/:id/dispatch` (tracking_number, provider), `PATCH /shipping/:id/deliver`.
- **Elements:** orders ready to ship, dispatch form, mark delivered.

### A08. Payments and refunds: NEEDS BACKEND
- **Needs:** payment events list, refund action (REFUNDED state exists in the docs).
- **Elements:** payment events per order, refund with confirmation.

### A09. Review moderation: NEEDS BACKEND (flag 8)
- **Endpoint:** `PATCH /reviews/:id/approve`; needs a pending-reviews list.
- **Elements:** pending queue, approve, reject.

### A10. Users and roles: NEEDS BACKEND
- **Needs:** users list, role assignment (roles ADMIN, CUSTOMER and permission tables exist).
- **Elements:** user table, role assign, permission view.

### A11. Audit log: NEEDS BACKEND
- **Needs:** `GET /audit-logs` (entity exists).
- **Elements:** filterable log (actor, action, entity, time).

---

## 5. System screens (3)

- **S01. Not found (404)**
- **S02. Server error / offline**
- **S03. Session expired** (refresh token failed, return to login without losing the cart)

---

## 6. Shared components (designed once, reused)

Header and footer, cart drawer, product row/tile, price formatter (minor units), stock badge, order status badge and timeline, coupon field, data table (admin), drawer form (admin), toast and inline error, empty state, skeleton loader, confirm dialog.

---

## 7. Design direction (draft, pending your approval)

- **Concept:** "honest commerce": calm, truthful, human. Matches a backend built around no overselling and no double charging.
- **Look:** warm paper background, one ink colour, one accent, large type. No shadowed grid cards. Without product images, products are typographic rows with a category-coloured monogram block.
- **Cart as a receipt:** total always visible, no late surprises.
- **Honest stock:** text like "3 left, held for you while you pay".
- **Order page as a sentence timeline** in plain language.
- **Human errors:** for example "Someone just bought the last one".
- **Admin:** same palette, dense tables.
- **Checkout:** 6 fields only (Baymard research: fewer form fields means better checkout UX).

## 8. Decisions still open

1. Add `image_url` to products, or stay typographic?
2. Guest cart (stored locally, merged at login) or login at "add to cart"?
3. Arabic RTL from day one?
4. Final order status names and labels (flag 7).

## 9. Suggested build order

1. **Stage 1, API ready:** C01, C02, C03, C04, C05, C06, C12, A02, A03, A05 (after the permission fix) and S01 to S03.
2. **Stage 2, small backend pass:** order read and cancel, profile and addresses, reviews list, roles guard. Unlocks C07 to C11, A06, A07, A09.
3. **Stage 3, later:** C13, C14, A01, A04, A08, A10, A11.
