# Qubrax Commerce Platform: Complete E2E UI Screen Inventory & Architecture Plan

**Document ID:** `docs/bugs/plan-ui-screen.md`  
**Source Platform:** `commerce-order-management-platform` (NestJS Clean Architecture Monolith: Auth, Catalog, Inventory, Cart, Coupons, Orders, Payments, Shipping, Reviews, Notifications, Audit, Users).  
**Coverage Scope:** True End-to-End (E2E) customer commerce lifecycle, complete merchant operational admin suite, and critical resilience/system screens.

---

## 1. Executive E2E Analysis: Is the UI Specification Truly E2E?

### 1.1 The Verdict
**No, the original draft was NOT truly E2E.**  
While the original 28 screens covered the high-level happy paths of browsing, cart, and admin tables, it had major architectural and functional gaps that would leave real-world users and merchant operators stranded in dead-ends:
1. **Critical Payment Simulation Gate:** The platform relies on asynchronous webhooks (`POST /api/v1/payments/webhook`). Without a customer-facing mock payment gateway screen (`C06B`), users cannot complete an order in local or staging environments.
2. **Missing Post-Purchase Customer Lifecycle:** No Order Cancellation request UI, no Return / Refund request UI (`C09B`), and no Order Invoice / Receipt print view (`C09C`).
3. **Guest Cart & Checkout Abandonment:** No guest checkout transition modal (`C04B`) to reconcile guest carts with registered customer accounts upon login.
4. **Dispute, Chargeback & Refund Management:** No merchant refund/chargeback execution console (`A08B`) to manage refunded payments or update inventory return states.
5. **Real-time Observability & Operational Readiness:** No system health & database telemetry dashboard (`A12`) for merchant DevOps to verify PostgreSQL connection pools, cache health, and cron notification outbox processing.

### 1.2 The Complete E2E Inventory: 36 Screens Total
To achieve **100% E2E coverage**, the screen inventory is expanded from 28 to **36 comprehensive screens**:
- **Customer Storefront (18 screens):** `C01` through `C15` + sub-flows (`C04B`, `C06B`, `C09B`, `C09C`).
- **Merchant Admin Console (14 screens):** `A01` through `A13` + sub-flows (`A08B`).
- **System & Error Screens (4 screens):** `S01` through `S04`.

---

## 2. Platform Reality & Completed Backend Alignments

Following the Clean Architecture, Clean Code, and Security refactoring, the backend status is significantly upgraded:

| # | Domain / Finding | Previous Blocker Status | Current Platform Resolution |
|---|---|---|---|
| **1** | **Permission Alignment** | Broken 403s on admin screens | **RESOLVED**: Permissions unified (`PermissionAction`: `CREATE_PRODUCT`, `ADJUST_INVENTORY`, `APPROVE_REVIEW`, `MANAGE_SHIPPING`, etc.) with legacy dot-notation aliases supported. |
| **2** | **Order Status & State Machine** | Divergent state machine | **RESOLVED**: Rich domain model on `Order` strictly enforces transitions: `PENDING_PAYMENT` -> `PAID` -> `SHIPPED` -> `DELIVERED`, and handles `PAYMENT_FAILED` or `CANCELLED`. |
| **3** | **Webhook Security & Idempotency** | Publicly spoofable webhooks | **RESOLVED**: HMAC-SHA256 signature verification (`x-payment-signature`) with timing-safe comparison and strict payload validation via `PaymentWebhookDto`. |
| **4** | **Docker-Free Persistence & Cache** | Dependent on Docker containers | **RESOLVED**: Native PostgreSQL integration with pgAdmin 4 support and automatic in-memory TTL store fallback when Redis is absent (`REDIS_ENABLED=false`). |
| **5** | **Order & Customer Endpoints** | Missing customer order history (`GET /orders`) | **PLANNED IN E2E SUITE**: Expose customer read endpoints: `GET /orders/my-orders`, `GET /orders/:id`, and `POST /orders/:id/cancel`. |
| **6** | **User Profile & Addresses** | Entities exist without API controllers | **PLANNED IN E2E SUITE**: Expose `GET /users/me`, `PATCH /users/me`, and address CRUD (`/users/me/addresses`). |
| **7** | **Product Image Strategy** | Text-only catalog | **RESOLVED**: Support optional `image_url` on `Product` with graceful typographic monogram fallbacks. |

---

## 3. Customer Storefront Screen Inventory (18 Screens)

### C01. Home & Discovery Landing
- **Purpose:** Brand landing, category discovery, hero value proposition, and newest curated products.
- **Endpoints:** `GET /categories`, `GET /products?sort_by=created_at&order=DESC&limit=8`.
- **Key Elements:** Responsive header with live cart count pill, hero announcement banner, category circular navigation, featured product row, trust badges (no overselling, instant refund guarantee), footer.
- **States:** Loading skeleton, empty catalog, API offline alert.

### C02. Catalog & Filter Matrix
- **Purpose:** Search, category filtering, price range slider, stock availability toggle, and sorting.
- **Endpoints:** `GET /products` (params: `search`, `category_id`, `min_price`, `max_price`, `sort_by`, `order`, `page`, `limit`), `GET /categories`.
- **Key Elements:** Search input with debounce, hierarchical category sidebar, dynamic facet counts, product grid/list toggle, stock badge, pagination controls.
- **States:** Filter loading, active filters chips, 0 results found (with search reset button), query error.

### C03. Product Detail & Live Invariants
- **Purpose:** Deep dive on product specs, stock state, quantity selection, and customer reviews.
- **Endpoints:** `GET /products/:id`, `GET /reviews?product_id=:id&status=APPROVED`, `POST /cart/items`.
- **Key Elements:** Product title, SKU, category breadcrumbs, rich description, real-time stock indicator ("Only 3 left in stock"), integer quantity stepper, "Add to Cart" button, customer review stars and verified purchase badge.
- **States:** In stock, low stock warning (< 5 units), out of stock (disabled CTA), adding to cart loader.

### C04. Shopping Cart Drawer & Full Page
- **Purpose:** Review selected items, adjust quantities, apply discount coupons, and view cost breakdown.
- **Endpoints:** `GET /cart`, `PATCH /cart/items/:productId`, `DELETE /cart/items/:productId`, `POST /cart/coupon`, `DELETE /cart/coupon`.
- **Key Elements:** Line item rows (thumbnail/monogram, SKU, unit price, quantity stepper, remove button), coupon input with instant validation pill, subtotal, discount total, calculated order total, checkout CTA.
- **States:** Empty cart state with "Start Shopping" button, invalid coupon message, expired coupon banner, item stock restriction alert.

### C04B. Guest Cart Login / Register Reconciliation Modal
- **Purpose:** Seamlessly merge an anonymous guest cart stored in client memory with the customer account upon login.
- **Endpoints:** `POST /auth/login`, `POST /cart/items` (batch merge).
- **Key Elements:** Modal prompt triggered when clicking "Proceed to Checkout" as guest: "Log in to checkout" vs "Create account", automatic cart transfer confirmation.
- **States:** Merging animation, conflict alert (item out of stock during merge).

### C05. Authentication (Login / Register / Refresh)
- **Purpose:** Customer registration, secure login, password validation, and token refresh.
- **Endpoints:** `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.
- **Key Elements:** Split tab layout (Login / Register), email input, password with show/hide toggle and strength meter, first/last name fields, remember me checkbox, submit loader.
- **States:** Inline validation errors, 401 unauthorized toast, account locked / rate-limited notification.

### C06. Single-Page Frictionless Checkout
- **Purpose:** Capture delivery destination and customer contact; initiate order reservation.
- **Endpoints:** `POST /orders/checkout` (payload: `idempotency_key`, `full_name`, `phone`, `country`, `city`, `street`, `postal_code`).
- **Key Elements:** 6 clean input fields, saved address quick-selector (for logged-in users), order review summary, client-side idempotency UUID generator, "Place Order & Pay" primary CTA.
- **States:** Validating address, 409 stock conflict modal ("Stock changed, cart updated"), processing loader, duplicate submission guard.

### C06B. Hosted / Mock Payment Gateway Simulation
- **Purpose:** Interactive customer payment portal simulating provider credit card / debit checkout and generating verifiable webhook callbacks.
- **Endpoints:** `POST /payments/mock/charge`, `POST /payments/webhook` (signed callback).
- **Key Elements:** Mock credit card form (Card Number, Expiry, CVV), "Simulate Success" button, "Simulate Failure" button, timer countdown for reservation expiration.
- **States:** Processing 3D-Secure simulation, payment succeeded redirect, payment failed error with retry button.

### C07. Order Confirmation & Payment Result
- **Purpose:** Immediate post-checkout status screen showing final order number and reservation status.
- **Endpoints:** `GET /orders/:id`.
- **Key Elements:** Success checkmark or failure warning banner, human-readable order reference, total paid, payment status badge (`PAID` or `PAYMENT_FAILED`), shipping destination snapshot, "Track Order" button.
- **States:** Polling for webhook completion, confirmed paid, payment declined (retry CTA).

### C08. Customer Order History ("My Orders")
- **Purpose:** Chronological overview of all past and active orders for the authenticated customer.
- **Endpoints:** `GET /orders/my-orders?page=1&limit=10`.
- **Key Elements:** Search by order number, filter by status (`ALL`, `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`), order summary cards with date, items preview, total amount, and quick links.
- **States:** Empty orders state, pagination controls, skeleton list loading.

### C09. Order Detail & Live Shipment Tracking
- **Purpose:** Comprehensive receipt, live delivery milestone timeline, and fulfillment carrier tracking.
- **Endpoints:** `GET /orders/:id`, `GET /shipping/:id`.
- **Key Elements:** Milestone sentence timeline ("Order Placed" -> "Payment Confirmed" -> "Dispatched with DHL" -> "Delivered"), carrier tracking link, itemized order lines, address snapshot, action buttons (Cancel, Return, Review).
- **States:** Active shipment in transit, delivered state, cancelled state.

### C09B. Order Return & Refund Request Drawer
- **Purpose:** Customer self-service return initiation for delivered orders.
- **Endpoints:** `POST /orders/:id/return`.
- **Key Elements:** Multi-item checkbox selector, return reason dropdown (Damaged, Wrong Item, Changed Mind), photo upload placeholder, refund destination selector, submit return button.
- **States:** Submitting request, return accepted banner with printable return label instructions.

### C09C. Printable Order Receipt / Tax Invoice
- **Purpose:** Clean, print-optimized invoice view conforming to international commerce standards.
- **Endpoints:** `GET /orders/:id/invoice`.
- **Key Elements:** Clean print stylesheet, merchant tax ID, billing/shipping address, itemized table with unit prices, discounts, subtotal, and total paid, browser print trigger.
- **States:** Standard browser print preview.

### C10. Customer Account & Security Profile
- **Purpose:** Manage personal contact details and authentication credentials.
- **Endpoints:** `GET /users/me`, `PATCH /users/me`, `POST /auth/change-password`.
- **Key Elements:** First name, last name, email address, password change form (current password, new password, confirmation), account security log.
- **States:** Profile updated success toast, invalid current password alert.

### C11. Saved Address Book Management
- **Purpose:** Add, edit, remove, and designate default shipping addresses.
- **Endpoints:** `GET /users/me/addresses`, `POST /users/me/addresses`, `PATCH /users/me/addresses/:id`, `DELETE /users/me/addresses/:id`.
- **Key Elements:** Address card grid, "Add New Address" modal form, "Set as Default" button, delete confirmation modal.
- **States:** No saved addresses empty state, address validation error.

### C12. Write a Product Review Modal
- **Purpose:** Submit verified customer feedback and star ratings following order fulfillment.
- **Endpoints:** `POST /reviews` (payload: `product_id`, `rating`, `comment`).
- **Key Elements:** Interactive 5-star rating widget, text review textarea with character counter, verified purchase badge indicator, submit button.
- **States:** Submitting loader, validation error (rating < 1 or > 5), "Review submitted for admin moderation" confirmation banner.

### C13. Customer Notification Center
- **Purpose:** Real-time and historical notification log for order status and delivery updates.
- **Endpoints:** `GET /notifications/my-notifications`, `PATCH /notifications/:id/read`.
- **Key Elements:** Notification item cards (Order Confirmed, Shipment Dispatched, Delivery Complete), unread indicator dot, "Mark all as read" button.
- **States:** Empty notifications list, loading skeleton.

### C14. Password Recovery & Reset Flow
- **Purpose:** Self-service password recovery via email tokens.
- **Endpoints:** `POST /auth/forgot-password`, `POST /auth/reset-password`.
- **Key Elements:** Forgot password email submission form, reset token input, new password entry with confirmation.
- **States:** Reset email dispatched notification, expired token error, password reset successful redirect.

### C15. Product Category Showcase
- **Purpose:** Dedicated category visual hub featuring child subcategories and top-selling products.
- **Endpoints:** `GET /categories/:id`, `GET /products?category_id=:id`.
- **Key Elements:** Category hero banner, subcategory filter pills, featured category products list.
- **States:** Empty category state, subcategory navigation.

---

## 4. Merchant Admin Console Screen Inventory (14 Screens)

### A01. Executive Operations Dashboard
- **Purpose:** High-level platform health, live revenue metrics, inventory alerts, and fulfillment velocity.
- **Endpoints:** `GET /admin/dashboard/metrics`, `GET /admin/orders/recent`, `GET /admin/inventory/alerts`.
- **Key Elements:** Metric KPI cards (Gross Revenue, Orders Today, Pending Shipments, Low Stock Items), recent orders stream, stock depletion warnings, payment failure exception chart.
- **States:** Real-time data refresh spinner, metric range picker (Today, 7 Days, 30 Days).

### A02. Product Catalog Management & Creation Drawer
- **Purpose:** Full catalog lifecycle management: create, edit, deactivate, and adjust product metadata.
- **Endpoints:** `GET /products`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`.
- **Key Elements:** Data table with search and category filters, "Create Product" sliding drawer (SKU, Name, Description, Price in minor units, Category dropdown, `image_url`, Active toggle), edit inline action, deactivation guard modal.
- **States:** Table loading skeleton, creation success toast, duplicate SKU error banner.

### A03. Category Hierarchy & Taxonomy Manager
- **Purpose:** Visual tree and list management for multi-level category taxonomy.
- **Endpoints:** `GET /categories`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`.
- **Key Elements:** Category nested tree view, parent category selector, slug generator, add root / add child category modal, safe delete guard (preventing orphan products).
- **States:** Cyclic parent hierarchy error alert, category saved toast.

### A04. Inventory Levels & Movement History Console
- **Purpose:** Centralized stock visibility across warehouse inventory with real-time reserve auditing.
- **Endpoints:** `GET /inventory`, `PATCH /inventory/:productId/adjust`, `GET /inventory/:productId/movements`.
- **Key Elements:** Comprehensive stock table (SKU, Product, Available Quantity, Reserved Quantity, Total Physical Stock), "Adjust Stock" modal (Movement Type: `ADD`, `DEDUCT`, `ADJUST`; Quantity; Reference), audit movement history modal.
- **States:** Stock adjusted toast, negative quantity prevention validation, movement history empty state.

### A05. Coupon & Promotion Campaign Manager
- **Purpose:** Create, monitor, and configure discount promo codes.
- **Endpoints:** `GET /coupons`, `POST /coupons`, `PATCH /coupons/:id`, `DELETE /coupons/:id`.
- **Key Elements:** Coupon table (Code, Type: `PERCENTAGE`/`FIXED`, Amount, Usage Count / Usage Limit, Expiry Date, Status badge), "Create Coupon" modal with percentage limit checks (`@Max(100)`), active toggle.
- **States:** Active/Expired/Exhausted status badges, coupon created toast.

### A06. Order Processing & Fulfillment Hub
- **Purpose:** Search, filter, inspect, and progress orders through fulfillment.
- **Endpoints:** `GET /orders` (admin filters: status, date range, search), `GET /orders/:id`, `PATCH /orders/:id/status`.
- **Key Elements:** Order master table, status pill filters (`PENDING_PAYMENT`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`), order detail slide-over (Customer info, Address snapshot, Line items, Payment ID, Shipping status, Action buttons).
- **States:** Filtering by status, order detail loading, status updated notification.

### A07. Shipping Dispatch & Courier Consignment Console
- **Purpose:** Dispatch paid orders, assign carrier tracking numbers, and confirm deliveries.
- **Endpoints:** `GET /shipping/pending`, `PATCH /shipping/:id/dispatch`, `PATCH /shipping/:id/deliver`.
- **Key Elements:** Queue of orders in `PAID` state ready for shipping, dispatch action modal (Carrier dropdown: DHL, FedEx, UPS, Local; Tracking Number input), "Mark Delivered" confirmation button.
- **States:** Shipment dispatched success toast, parent order status synchronized to `SHIPPED`.

### A08. Payment Events & Financial Audit Stream
- **Purpose:** Real-time visibility into all incoming payment provider webhooks and transaction events.
- **Endpoints:** `GET /payments/events`, `GET /payments/events/:id`.
- **Key Elements:** Event table (Event ID, Order ID, Event Type: `payment.succeeded`, `payment.failed`, Amount, HMAC Signature status, Received Timestamp), raw JSON payload viewer drawer.
- **States:** Unverified webhook warning flag, live transaction stream filter.

### A08B. Refund & Dispute Resolution Console
- **Purpose:** Process full or partial refunds for cancelled or returned orders.
- **Endpoints:** `POST /payments/:orderId/refund`.
- **Key Elements:** Refund action modal, refund reason dropdown, refund amount input, stock restock toggle ("Return items to available inventory"), refund confirmation guard.
- **States:** Refund processing loader, refund success confirmation banner.

### A09. Customer Review Moderation Queue
- **Purpose:** Moderate and approve customer product reviews before they appear publicly.
- **Endpoints:** `GET /reviews/pending`, `PATCH /reviews/:id/approve`, `DELETE /reviews/:id`.
- **Key Elements:** Pending review cards (Product Name, Reviewer, Star Rating, Review Comment, Date), one-click "Approve" button, "Reject" button with optional reason modal.
- **States:** Empty queue state ("All reviews moderated"), review approved toast.

### A10. Users, Staff & RBAC Role Assignment
- **Purpose:** Manage registered user accounts, assign administrative roles, and inspect permissions.
- **Endpoints:** `GET /users`, `PATCH /users/:id/roles`, `GET /roles/permissions`.
- **Key Elements:** User table (Name, Email, Assigned Roles: `ADMIN`, `STAFF`, `CUSTOMER`, Registration Date), "Edit Roles" modal, granular permission matrix inspector.
- **States:** Role updated toast, self-demotion prevention guard.

### A11. System Security & Operational Audit Log
- **Purpose:** Immutable audit trail tracking critical administrative and operational modifications.
- **Endpoints:** `GET /audit-logs`.
- **Key Elements:** Filterable audit table (Actor ID/Email, Action: `CREATE_PRODUCT`, `ADJUST_INVENTORY`, `DISPATCH_SHIPMENT`; Entity Type; Entity ID; Timestamp; Diff Viewer), JSON diff modal showing before/after changes.
- **States:** Date range filtering, log details modal.

### A12. System Telemetry & Database Health Dashboard
- **Purpose:** Live operational metrics for PostgreSQL connections, cache store status, and background tasks.
- **Endpoints:** `GET /api/v1/health`.
- **Key Elements:** Database connection pool indicator (`PostgreSQL 127.0.0.1:5432: UP`), Cache status (`In-Memory TTL Store: ACTIVE`), Cron background notification processor health.
- **States:** Healthy green pulse, degraded component alert banner.

### A13. Administrative Settings & Store Configuration
- **Purpose:** Configure store currency formatting, tax rates, contact info, and maintenance mode.
- **Endpoints:** `GET /admin/settings`, `PATCH /admin/settings`.
- **Key Elements:** Store identity form, default currency code, tax rules toggle, webhook endpoint secret inspector.
- **States:** Settings saved toast.

---

## 5. System Resilience & Error Screens (4 Screens)

### S01. Not Found (404 Page)
- **Purpose:** Friendly recovery screen when a customer navigates to a non-existent product, category, or URL.
- **Key Elements:** Clear "Page Not Found" heading, helpful navigation suggestions (Search bar, Popular Categories, Back to Home CTA).

### S02. Server Error & Offline Alert (500 Page)
- **Purpose:** Resilient error fallback screen when the backend API is temporarily unreachable or experiences an internal exception.
- **Key Elements:** Reassuring error message ("We're having trouble connecting to our servers"), automated retry timer, "Check System Health" link, support contact email.

### S03. Session Expired & Seamless Cart Preservation Modal
- **Purpose:** Handles expired JWT refresh tokens without discarding customer cart contents.
- **Key Elements:** Friendly session expiry alert modal, quick inline password re-authentication form, preserves current URL route and active cart state upon successful re-login.

### S04. Stock Conflict / Concurrency Resolution Modal
- **Purpose:** Real-time customer resolution when item inventory is depleted by another customer during the checkout phase.
- **Key Elements:** Clear explanation of item scarcity ("An item in your cart was just purchased by another customer"), updated available cart quantity summary, "Accept changes & continue checkout" button.

---

## 6. Global Design Language & Component System

- **Visual Concept:** "Honest Commerce" — clean, authoritative, transparent typography with clear visual hierarchies.
- **Color Palette:**
  - *Paper Warm Canvas:* `#FBFBF9`
  - *Ink Charcoal Body:* `#1A1A1A`
  - *Primary Accent Amber:* `#D97706` / `#B45309`
  - *Success Emerald:* `#059669`
  - *Danger Crimson:* `#DC2626`
  - *Muted Slate Borders:* `#E5E7EB`
- **Typography:** Inter / SF Pro with tabular numbers for prices (`font-variant-numeric: tabular-nums`).
- **Core Design Principles:**
  1. *Minor Unit Precision:* Zero floating-point rounding errors on screen; prices formatted with exact cent precision (`$150.00`).
  2. *Live Invariant Transparency:* Transparent stock counters prevent customer disappointment during checkout.
  3. *Immediate Error Clarity:* Clear human-readable error messages over raw HTTP codes.
