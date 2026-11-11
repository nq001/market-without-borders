# Qubrax Commerce Platform: E2E UI Implementation & Validation Tasks

**Document ID:** `docs/bugs/tasks-ui-screen.md`  
**Purpose:** Actionable, phase-by-phase implementation checklist for all 36 screens across Customer Storefront, Merchant Admin, and System Resilience layers.

---

## Phase 1: Shared Design System & Foundations

- [ ] **T1.1 Core Typography & Tokens:** Define design tokens for `#FBFBF9` warm canvas, typography scale, borders, and tabular numbers formatting.
- [ ] **T1.2 Price Formatter Utility:** Implement minor-unit currency formatter converting raw integer cents (e.g. `150000`) to localized currency strings (`$1,500.00`).
- [ ] **T1.3 Shared Layout Components:**
  - [ ] Customer Header with live cart count badge, search bar, and auth state dropdown.
  - [ ] Customer Footer with category sitemap, store guarantees, and status links.
  - [ ] Merchant Admin Sidebar with role-based navigation links, badge counters, and collapse toggle.
  - [ ] Admin Page Header with breadcrumbs and action drawer trigger buttons.
- [ ] **T1.4 Reusable UI Primitives:**
  - [ ] Star Rating input & display component (`1` to `5` with half-star rendering).
  - [ ] Stock availability badge (`IN STOCK`, `LOW STOCK - N LEFT`, `OUT OF STOCK`).
  - [ ] Order Status milestone timeline badge (`PENDING_PAYMENT`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  - [ ] Slide-over Drawer component with keyboard trap and focus restoration.
  - [ ] Modal Dialog primitive with backdrop blur and escape dismissal.
  - [ ] Toast notification manager supporting `success`, `error`, `warning`, and `info`.

---

## Phase 2: Customer Storefront Screens (C01 - C15)

### Discovery & Catalog
- [ ] **T2.1 C01 Home & Discovery Landing:**
  - [ ] Build hero banner with dynamic category pills.
  - [ ] Connect `GET /categories` and `GET /products?sort_by=created_at&limit=8`.
  - [ ] Implement skeleton placeholders and offline fallback banners.
- [ ] **T2.2 C02 Catalog & Filter Matrix:**
  - [ ] Implement search bar with 300ms debounce.
  - [ ] Implement category hierarchical filter sidebar.
  - [ ] Implement min/max price range sliders and stock availability checkbox.
  - [ ] Integrate pagination controls and empty search result state.
- [ ] **T2.3 C03 Product Detail & Live Invariants:**
  - [ ] Render product SKU, title, formatted price, and category breadcrumb.
  - [ ] Bind real-time stock indicator (`available_quantity`).
  - [ ] Build quantity increment/decrement stepper bounded by available stock.
  - [ ] Embed customer review section with verified purchase badge.
- [ ] **T2.4 C15 Product Category Showcase:**
  - [ ] Render dedicated category hero landing with subcategories filter pills.

### Cart & Guest Reconciliation
- [ ] **T2.5 C04 Shopping Cart Drawer & Page:**
  - [ ] Build line item rows with quantity adjusters and inline removal triggers.
  - [ ] Build promo coupon entry field with instant apply/remove API integration.
  - [ ] Calculate live subtotal, discount reduction, and final order total.
  - [ ] Handle empty cart state with "Browse Products" CTA.
- [ ] **T2.6 C04B Guest Cart Reconciliation Modal:**
  - [ ] Intercept guest checkout action with modal prompt.
  - [ ] Synchronize client-stored cart items with account cart upon authentication.

### Authentication & Security
- [ ] **T2.7 C05 Authentication (Login / Register):**
  - [ ] Implement tabbed layout for Login and Registration modes.
  - [ ] Build client validation schema (email format, password min 8 characters).
  - [ ] Store access and refresh tokens securely with automatic refresh handling.
- [ ] **T2.8 C10 Customer Account & Security Profile:**
  - [ ] Profile data form (`GET /users/me`, `PATCH /users/me`).
  - [ ] Change password drawer with confirmation checks.
- [ ] **T2.9 C14 Password Recovery & Reset Flow:**
  - [ ] Forgot password email submission form.
  - [ ] Reset token verification and new password submission.

### Checkout & Payment Lifecycle
- [ ] **T2.10 C06 Single-Page Frictionless Checkout:**
  - [ ] Implement 6-field address form (Full Name, Phone, Country, City, Street, Postal Code).
  - [ ] Integrate saved address quick-picker for logged-in users.
  - [ ] Generate client-side UUID v4 idempotency key per checkout attempt.
  - [ ] Handle 409 stock conflict modal intercepting stale stock errors.
- [ ] **T2.11 C06B Hosted / Mock Payment Gateway Simulation:**
  - [ ] Build interactive payment simulation screen with mock card inputs.
  - [ ] Implement "Simulate Success" and "Simulate Failure" actions.
  - [ ] Trigger signed webhook callback with HMAC signature calculation.
- [ ] **T2.12 C07 Order Confirmation & Payment Result:**
  - [ ] Render confirmation banner with unique order number.
  - [ ] Poll order status (`GET /orders/:id`) until transition to `PAID` or `PAYMENT_FAILED`.
  - [ ] Display retry button if payment fails without losing order items.

### Post-Purchase, Tracking & Account
- [ ] **T2.13 C08 Customer Order History ("My Orders"):**
  - [ ] Build chronological order cards with date, items summary, and total amount.
  - [ ] Add status filter tabs (`ALL`, `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`).
- [ ] **T2.14 C09 Order Detail & Live Shipment Tracking:**
  - [ ] Build progressive sentence milestone timeline for order states.
  - [ ] Integrate courier tracking link and delivery status events.
  - [ ] Add cancellation trigger for eligible order states (`PENDING_PAYMENT`).
- [ ] **T2.15 C09B Order Return & Refund Request Drawer:**
  - [ ] Multi-item return selector with return reason dropdown.
  - [ ] Generate return authorization instructions and printable label summary.
- [ ] **T2.16 C09C Printable Order Receipt / Tax Invoice:**
  - [ ] Build print-optimized CSS layout for customer invoices.
- [ ] **T2.17 C11 Saved Address Book Management:**
  - [ ] Address card grid with "Add New Address" modal.
  - [ ] Set as default and delete address confirmations.
- [ ] **T2.18 C12 Write a Product Review Modal:**
  - [ ] Interactive 5-star rating selector and comment input.
  - [ ] Submit payload to `POST /reviews` with moderation notification banner.
- [ ] **T2.19 C13 Customer Notification Center:**
  - [ ] In-app notification list displaying order confirmation and shipping alerts.
  - [ ] "Mark as read" interaction and unread badge count.

---

## Phase 3: Merchant Admin Console Screens (A01 - A13)

- [ ] **T3.1 A01 Executive Operations Dashboard:**
  - [ ] KPI summary cards (Gross Revenue, Orders Today, Pending Shipments, Low Stock).
  - [ ] Real-time recent orders list with quick status links.
- [ ] **T3.2 A02 Product Catalog Management & Creation Drawer:**
  - [ ] Searchable product data table with SKU, price, category, and status.
  - [ ] Slide-over drawer for product creation and metadata editing.
  - [ ] Deactivation confirmation guard.
- [ ] **T3.3 A03 Category Hierarchy & Taxonomy Manager:**
  - [ ] Nested category tree rendering parent and child nodes.
  - [ ] Category creation modal with auto-slug generation.
  - [ ] Cyclic hierarchy prevention validation.
- [ ] **T3.4 A04 Inventory Levels & Movement History Console:**
  - [ ] Inventory table displaying available vs reserved quantities.
  - [ ] Stock adjustment modal supporting `ADD`, `DEDUCT`, and `ADJUST` types.
  - [ ] Movement audit log drawer for individual products.
- [ ] **T3.5 A05 Coupon & Promotion Campaign Manager:**
  - [ ] Promotion code table with usage counts, limits, and expiry dates.
  - [ ] Create coupon modal with percentage limit checks (`@Max(100)`).
- [ ] **T3.6 A06 Order Processing & Fulfillment Hub:**
  - [ ] Searchable order table with status pills and date filtering.
  - [ ] Order detail inspector drawer displaying customer info, address snapshot, and order lines.
- [ ] **T3.7 A07 Shipping Dispatch & Courier Consignment Console:**
  - [ ] Pending shipment dispatch queue.
  - [ ] Courier consignment modal (Carrier selection, tracking number input).
  - [ ] Delivery confirmation action synchronizing order state to `DELIVERED`.
- [ ] **T3.8 A08 Payment Events & Financial Audit Stream:**
  - [ ] Real-time webhook transaction stream with signature validity badges.
  - [ ] Raw JSON payload inspector drawer.
- [ ] **T3.9 A08B Refund & Dispute Resolution Console:**
  - [ ] Refund execution modal supporting full and partial refunds.
  - [ ] Inventory restock toggle option.
- [ ] **T3.10 A09 Customer Review Moderation Queue:**
  - [ ] Review moderation queue displaying pending star ratings and comments.
  - [ ] One-click "Approve" and "Reject" buttons.
- [ ] **T3.11 A10 Users, Staff & RBAC Role Assignment:**
  - [ ] User directory with assigned roles (`ADMIN`, `STAFF`, `CUSTOMER`).
  - [ ] Role modification modal with self-demotion protection.
- [ ] **T3.12 A11 System Security & Operational Audit Log:**
  - [ ] Filterable audit log showing actors, actions, timestamps, and JSON diffs.
- [ ] **T3.13 A12 System Telemetry & Database Health Dashboard:**
  - [ ] Live PostgreSQL connection health, memory cache status, and cron processor state.
- [ ] **T3.14 A13 Administrative Settings & Store Configuration:**
  - [ ] Store currency, tax configuration, and webhook secret management.

---

## Phase 4: System Resilience & Error Screens (S01 - S04)

- [ ] **T4.1 S01 Not Found (404 Page):** Friendly page not found layout with search input and home redirect.
- [ ] **T4.2 S02 Server Error & Offline Alert (500 Page):** Resilient server failure page with retry timer.
- [ ] **T4.3 S03 Session Expired & Seamless Cart Preservation Modal:** Session expiration re-login modal preserving active cart.
- [ ] **T4.4 S04 Stock Conflict / Concurrency Resolution Modal:** Real-time stock depletion resolution dialog.

---

## Phase 5: End-to-End Verification & Quality Gates

- [ ] **T5.1 Responsive Verification:** Validate all 36 screens across Mobile (375px), Tablet (768px), and Desktop (1440px).
- [ ] **T5.2 Accessibility & Keyboard Navigation:** Verify ARIA labels, focus trapping on drawers/modals, and keyboard navigation.
- [ ] **T5.3 Minor-Unit Pricing Accuracy:** Verify that floating point numbers are never displayed.
- [ ] **T5.4 Docker-Free Local Verification:** Verify that all UI screens function flawlessly against native local PostgreSQL and in-memory cache without Docker.
