# Qubrax Commerce Platform: E2E User Journey Scenarios for Every UI Screen

**Document ID:** `docs/bugs/scenario-ui-screen.md`  
**Purpose:** Concrete, end-to-end user journeys, acceptance criteria, invariant verifications, and edge-case scenarios for all 36 screens in the platform.

---

## Part 1: Customer Storefront Scenarios (C01 - C15)

### Scenario C01: Home & Discovery Landing
- **User Story:** As a prospective customer, I want to land on an uncluttered homepage where I immediately understand the store's value proposition, explore top categories, and see the newest additions.
- **Preconditions:** Catalog is seeded with active products and categories.
- **Action Flow:**
  1. User navigates to `/`.
  2. The system renders the header, announcement banner, category navigation circles, and newest 8 products.
  3. User clicks on the "Electronics" category circle.
- **Acceptance Criteria & Verification:**
  - Header displays active cart count (0 for new guests).
  - Product tiles display formatted prices in minor units (e.g. `$1,500.00`) with no floating-point rounding errors.
  - Clicking a category navigates to `/catalog?category_id=<uuid>`.

### Scenario C02: Catalog Search, Filter & Pagination
- **User Story:** As a shopper, I want to filter products by category, adjust price range, search by keyword, and browse paginated results.
- **Action Flow:**
  1. User navigates to `/catalog`.
  2. User enters `"laptop"` into the search box; system debounces 300ms and filters products.
  3. User toggles the price slider to maximum `$2,000.00`.
  4. User toggles "In Stock Only" checkbox.
- **Acceptance Criteria & Verification:**
  - Active filter chips render above the product grid with clear buttons.
  - Zero results state displays a friendly message and a "Reset All Filters" CTA.
  - Out of stock items are visually marked with a muted badge.

### Scenario C03: Product Details & Real-Time Stock Invariants
- **User Story:** As a customer, I want to view detailed product specs, verify available stock, read verified customer reviews, and add items to my cart.
- **Action Flow:**
  1. User clicks on a product card to open `/products/:id`.
  2. The system loads product metadata, available inventory (`available_quantity`), and approved reviews.
  3. If stock is 3, the quantity stepper prevents selecting more than 3 units.
  4. User clicks "Add to Cart".
- **Acceptance Criteria & Verification:**
  - Stock indicator reflects actual `available_quantity` from database.
  - Add to cart button is disabled when `available_quantity === 0`.
  - Adding to cart updates the cart badge count instantly and slides open the cart drawer (`C04`).

### Scenario C04: Shopping Cart Adjustments & Coupon Validation
- **User Story:** As a shopper, I want to adjust quantities in my cart, apply promo coupons, and see an accurate price breakdown before checkout.
- **Action Flow:**
  1. User opens the cart drawer `/cart`.
  2. User increases the item quantity from 1 to 2; subtotal updates.
  3. User enters coupon code `"WELCOME10"` and clicks "Apply".
  4. System validates coupon applicability, usage limit, and expiration via `POST /cart/coupon`.
- **Acceptance Criteria & Verification:**
  - Applied coupon displays percentage/fixed discount deduction.
  - Order total accurately calculates: `Total = Subtotal - Discount`.
  - Invalid/expired coupon displays an inline red error toast without resetting cart items.

### Scenario C04B: Guest Cart Reconciliation
- **User Story:** As a guest shopper with items in my local cart, I want to log in and have those items automatically merged into my account cart.
- **Action Flow:**
  1. Unauthenticated guest with 2 items clicks "Proceed to Checkout".
  2. Modal `C04B` opens: "Log in or create an account to complete your purchase".
  3. Guest logs in with email and password.
- **Acceptance Criteria & Verification:**
  - System calls batch add cart API, transferring guest items into the authenticated user's cart.
  - User is redirected seamlessly to the checkout screen (`C06`) with all items intact.

### Scenario C05: Customer Authentication & Session Refresh
- **User Story:** As a user, I want to securely log in or create an account with inline validation and automatic session refresh.
- **Action Flow:**
  1. User navigates to `/login`.
  2. User enters email and password; system validates password length (min 8 chars).
  3. User clicks "Log In".
- **Acceptance Criteria & Verification:**
  - Tokens (`accessToken` and `refreshToken`) are stored securely.
  - Access token expiry automatically triggers silent background refresh via `POST /auth/refresh`.
  - Failed authentication displays a clear error message without revealing user existence.

### Scenario C06: Frictionless Single-Page Checkout
- **User Story:** As a buyer, I want to enter my delivery address and review my order on a single page with guaranteed stock protection.
- **Action Flow:**
  1. Authenticated user proceeds to `/checkout`.
  2. User enters 6 address fields (Full Name, Phone, Country, City, Street, Postal Code).
  3. Client generates a unique UUID `idempotency_key`.
  4. User clicks "Place Order & Pay".
- **Acceptance Criteria & Verification:**
  - System executes atomic reservation: reserves inventory, creates order in `PENDING_PAYMENT` state, snapshots address, and clears cart.
  - If stock was taken by a concurrent buyer, modal `S04` appears with options to update cart.
  - On success, user is redirected to the payment simulation screen (`C06B`).

### Scenario C06B: Hosted / Mock Payment Simulation
- **User Story:** As a customer, I want to simulate my credit card payment and verify instant payment authorization.
- **Action Flow:**
  1. User is on `/checkout/pay/:orderId`.
  2. Screen displays order total, masked card input, and two simulation buttons: "Pay Successfully" and "Simulate Decline".
  3. User clicks "Pay Successfully".
- **Acceptance Criteria & Verification:**
  - System dispatches a signed webhook callback (`POST /api/v1/payments/webhook`) with HMAC-SHA256 signature in `x-payment-signature`.
  - Payment is verified, inventory is deducted (`deductReserved`), order status transitions to `PAID`, and user is redirected to `C07`.

### Scenario C07: Order Confirmation & Payment Result
- **User Story:** As a buyer, I want immediate confirmation that my payment was received and my order is confirmed.
- **Action Flow:**
  1. User lands on `/orders/:id/confirmed`.
  2. Screen polls `GET /orders/:id` until order status transitions from `PENDING_PAYMENT` to `PAID`.
- **Acceptance Criteria & Verification:**
  - Green success checkmark with distinct Order Number (e.g. `ORD-2026-9481`).
  - Itemized receipt, shipping address snapshot, and estimated delivery timeline.
  - "View Order Details" and "Continue Shopping" links.

### Scenario C08: Customer Order History ("My Orders")
- **User Story:** As a returning customer, I want to view all my past orders, check fulfillment states, and re-order or inspect details.
- **Action Flow:**
  1. User navigates to `/account/orders`.
  2. System fetches `GET /orders/my-orders`.
  3. User filters orders by tab `PAID`.
- **Acceptance Criteria & Verification:**
  - Orders display date, order number, line items count, total paid, and status badge.
  - Clicking an order card opens the comprehensive order tracking screen (`C09`).

### Scenario C09: Order Tracking & Live Shipment Milestones
- **User Story:** As a customer, I want to track the exact progress of my order from payment to doorstep delivery.
- **Action Flow:**
  1. User opens `/account/orders/:id`.
  2. Milestone sentence timeline renders:
     - "Order Placed & Reserved" (Completed)
     - "Payment Authorized" (Completed)
     - "Dispatched via DHL — Tracking: `DHL-991823`" (Active)
     - "Out for Delivery" (Pending)
- **Acceptance Criteria & Verification:**
  - Live carrier tracking link opens carrier tracking portal in a new tab.
  - Eligible action buttons render according to order state:
    - If `PENDING_PAYMENT`: "Cancel Order" button is enabled.
    - If `DELIVERED`: "Request Return" (`C09B`) and "Write a Review" (`C12`) buttons are enabled.

### Scenario C09B: Customer Self-Service Return Request
- **User Story:** As a customer with a delivered item, I want to request a return for a damaged or unwanted product.
- **Action Flow:**
  1. Customer clicks "Request Return" on a delivered order.
  2. Drawer `C09B` opens; user checks the specific item and selects reason: "Item arrived damaged".
  3. User clicks "Submit Return Request".
- **Acceptance Criteria & Verification:**
  - Return request record is created.
  - User receives confirmation instructions with return address and RMA number.

### Scenario C09C: Printable Order Tax Invoice
- **User Story:** As a customer or business buyer, I want to view and print a compliant tax invoice for my records.
- **Action Flow:**
  1. User clicks "Print Invoice" from the order detail page.
  2. Clean printable invoice view `/account/orders/:id/invoice` opens and triggers browser print dialog.
- **Acceptance Criteria & Verification:**
  - Formatted with company details, tax registration number, customer address snapshot, itemized breakdown, and total paid.

### Scenario C10: Customer Profile & Security Settings
- **User Story:** As an account holder, I want to update my name, email, and change my password.
- **Action Flow:**
  1. User navigates to `/account/profile`.
  2. User edits first name and last name, then clicks "Save Changes".
  3. User fills out "Change Password" form (current password, new password).
- **Acceptance Criteria & Verification:**
  - Profile updates successfully with confirmation toast.
  - Password change validates current password and applies new hash.

### Scenario C11: Saved Addresses Management
- **User Story:** As a frequent shopper, I want to save multiple delivery addresses and choose a default for quick checkout.
- **Action Flow:**
  1. User navigates to `/account/addresses`.
  2. User clicks "Add New Address" modal, fills in details, and checks "Set as Default".
  3. User clicks "Save Address".
- **Acceptance Criteria & Verification:**
  - New address appears in the address grid marked with "Default" badge.
  - Selected default address is pre-filled on the checkout page (`C06`).

### Scenario C12: Verified Customer Review Submission
- **User Story:** As a verified buyer, I want to rate and review a purchased product.
- **Action Flow:**
  1. User clicks "Write a Review" on a delivered order item.
  2. Modal `C12` opens; user selects 5 stars and writes: "Excellent build quality and fast delivery!".
  3. User clicks "Submit Review".
- **Acceptance Criteria & Verification:**
  - Submission validated via `CreateReviewDto` (`rating` integer 1-5, non-empty comment).
  - User receives a banner: "Thank you! Your review has been submitted for moderation."
  - Review remains pending until approved by merchant in `A09`.

### Scenario C13: In-App Notification Center
- **User Story:** As a customer, I want to view notification alerts regarding order confirmation, shipment, and delivery.
- **Action Flow:**
  1. User clicks the bell icon in the header.
  2. Notifications list displays: "Order `ORD-101` has been shipped with DHL".
  3. User clicks "Mark as read".
- **Acceptance Criteria & Verification:**
  - Unread badge counter updates immediately.

### Scenario C14: Password Reset Recovery Flow
- **User Story:** As a customer who forgot my password, I want to receive a reset token and establish a new password.
- **Action Flow:**
  1. User clicks "Forgot Password" on the login screen.
  2. User enters email and clicks "Send Reset Link".
  3. User opens reset link with token, enters new password twice, and submits.
- **Acceptance Criteria & Verification:**
  - New password is encrypted; user is redirected to login with a success toast.

### Scenario C15: Category Visual Showcase
- **User Story:** As a shopper browsing categories, I want to see a visual category landing page with subcategories.
- **Action Flow:**
  1. User navigates to `/category/electronics`.
  2. Hero shows category banner and child category pills ("Laptops", "Smartphones", "Audio").
- **Acceptance Criteria & Verification:**
  - Clicking child category filters product catalog instantly.

---

## Part 2: Merchant Admin Console Scenarios (A01 - A13)

### Scenario A01: Executive Operations Dashboard
- **Merchant Story:** As a store owner, I want a real-time operational pulse of sales volume, pending shipments, and stock risks.
- **Action Flow:**
  1. Admin logs in and opens `/admin/dashboard`.
  2. System loads aggregated KPI metrics: Total Sales ($), Orders Today, Pending Shipments, and Depleted Stock Items.
- **Acceptance Criteria & Verification:**
  - Highlighting critical attention areas (e.g. 3 failed payments, 2 out-of-stock items).
  - Clicking "Pending Shipments" card navigates directly to `A07`.

### Scenario A02: Product Catalog & Stock Creation Drawer
- **Merchant Story:** As a catalog manager, I want to add new products, adjust pricing, and toggle product visibility.
- **Action Flow:**
  1. Admin opens `/admin/products`.
  2. Admin clicks "Create Product" button; slide-over drawer opens.
  3. Admin enters SKU `"LAP-990"`, Title `"Ultra Laptop 16"`, Price in cents `189900` (`$1,899.00`), selects Category, and saves.
- **Acceptance Criteria & Verification:**
  - Product is saved in database and initialized with inventory row (`available_quantity: 0`).
  - Cache is invalidated; product appears immediately in customer catalog `C02`.

### Scenario A03: Category Hierarchy & Taxonomy Manager
- **Merchant Story:** As an inventory manager, I want to structure category trees and ensure no cyclical parent references.
- **Action Flow:**
  1. Admin opens `/admin/categories`.
  2. Admin clicks "Add Subcategory" under "Electronics", inputs name `"Gaming Laptops"`, and saves.
- **Acceptance Criteria & Verification:**
  - Category hierarchy is rendered as an interactive tree.
  - Cycle detection prevents assigning a category's child as its own parent.

### Scenario A04: Warehouse Stock Adjustment & Movement History
- **Merchant Story:** As a warehouse manager, I want to record physical stock arrivals and inspect historical movements.
- **Action Flow:**
  1. Admin opens `/admin/inventory`.
  2. Admin clicks "Adjust Stock" on SKU `"LAP-123"`.
  3. Admin selects type `ADD`, enters quantity `50`, notes reference `"PO-2026-08"`, and confirms.
- **Acceptance Criteria & Verification:**
  - `available_quantity` increases by 50.
  - `InventoryMovement` record is logged with timestamp, user ID, and reference.
  - Movement audit modal shows chronological ledger of all `ADD`, `RESERVE`, and `DEDUCT` actions.

### Scenario A05: Promotion & Coupon Campaign Configuration
- **Merchant Story:** As a marketing manager, I want to launch a 15% discount campaign with a total usage limit.
- **Action Flow:**
  1. Admin opens `/admin/coupons`.
  2. Admin clicks "Create Coupon", sets code `"SUMMER15"`, type `PERCENTAGE`, amount `15`, limit `100`, expiry date, and saves.
- **Acceptance Criteria & Verification:**
  - Validation blocks percentage discounts greater than 100.
  - Counter tracks `times_used / usage_limit` live as customers checkout.

### Scenario A06: Order Processing & Status Inspection Hub
- **Merchant Story:** As an order fulfillment agent, I want to inspect customer orders, verify payments, and view address snapshots.
- **Action Flow:**
  1. Admin opens `/admin/orders`.
  2. Admin filters orders by `PAID`.
  3. Admin clicks on order `ORD-2026-9481` to open the detail slide-over.
- **Acceptance Criteria & Verification:**
  - Slide-over displays frozen address snapshot, line items, payment event ID, and current shipping status.
  - State machine transition controls reflect valid next states.

### Scenario A07: Courier Dispatch & Delivery Confirmation
- **Merchant Story:** As a fulfillment dispatcher, I want to assign tracking numbers to paid orders and mark shipments as dispatched.
- **Action Flow:**
  1. Admin opens `/admin/shipping`.
  2. Admin selects order ready for fulfillment, clicks "Dispatch", selects Carrier `"DHL"`, and inputs tracking number `"DHL-887766"`.
  3. Admin clicks "Confirm Dispatch".
- **Acceptance Criteria & Verification:**
  - Shipment status transitions to `SHIPPED`.
  - Parent `Order.status` synchronizes automatically to `SHIPPED`.
  - Customer receives notification email/alert (`C13`).

### Scenario A08: Payment Webhook Audit & Event Stream
- **Merchant Story:** As a financial auditor, I want to inspect incoming payment provider webhooks and verify HMAC signatures.
- **Action Flow:**
  1. Admin opens `/admin/payments/events`.
  2. Admin inspects transaction stream displaying event IDs, amounts, and signature statuses.
  3. Admin clicks an event to inspect raw JSON payload.
- **Acceptance Criteria & Verification:**
  - Verified webhooks display green signature badge; unverified/tampered webhooks display red alert flag.

### Scenario A08B: Dispute & Refund Execution Console
- **Merchant Story:** As a support lead, I want to issue a refund for a returned product and optionally restock the inventory.
- **Action Flow:**
  1. Admin opens `/admin/payments/refunds`.
  2. Admin inputs Order ID, refund amount, reason, and toggles "Restock Items into Available Inventory".
  3. Admin clicks "Process Refund".
- **Acceptance Criteria & Verification:**
  - Order status transitions to `REFUNDED`.
  - Inventory is automatically replenished (`available_quantity += refunded_qty`).
  - Audit log records financial refund action.

### Scenario A09: Customer Review Moderation Queue
- **Merchant Story:** As a community manager, I want to review submitted customer feedback and approve legitimate reviews.
- **Action Flow:**
  1. Admin opens `/admin/reviews`.
  2. Admin reviews pending submission: 5 stars, "Great product!".
  3. Admin clicks "Approve".
- **Acceptance Criteria & Verification:**
  - Review status changes from `PENDING` to `APPROVED`.
  - Review becomes visible immediately on public product detail page (`C03`).

### Scenario A10: User Management & RBAC Role Assignment
- **Merchant Story:** As a system administrator, I want to grant staff permissions to a newly hired team member.
- **Action Flow:**
  1. Admin opens `/admin/users`.
  2. Admin locates user `"staff@qubrax.com"` and clicks "Edit Roles".
  3. Admin checks `STAFF` role and saves.
- **Acceptance Criteria & Verification:**
  - User receives staff permissions without gaining full admin rights.
  - Self-demotion guard blocks current admin from revoking their own admin role.

### Scenario A11: Security & Administrative Audit Log
- **Merchant Story:** As a compliance officer, I want an immutable audit trail of who modified stock or products.
- **Action Flow:**
  1. Admin opens `/admin/audit-logs`.
  2. Admin filters by action `"ADJUST_INVENTORY"`.
  3. Admin clicks log entry to view JSON diff modal showing quantity changed from `10` to `60`.
- **Acceptance Criteria & Verification:**
  - Immutable logs show exact actor ID, entity modified, timestamp, and before/after snapshot.

### Scenario A12: System Health & Database Telemetry
- **Merchant Story:** As a DevOps engineer, I want to verify database connection pools and cache health without Docker.
- **Action Flow:**
  1. Admin opens `/admin/system/health`.
  2. Screen connects to `GET /api/v1/health`.
- **Acceptance Criteria & Verification:**
  - Displays PostgreSQL 127.0.0.1:5432: `HEALTHY`.
  - Displays Cache: `IN-MEMORY TTL STORE ACTIVE`.
  - Displays Cron background worker: `RUNNING`.

### Scenario A13: Store Configuration & Webhook Keys
- **Merchant Story:** As an administrator, I want to configure default store currency formatting and inspect webhook secrets.
- **Action Flow:**
  1. Admin opens `/admin/settings`.
  2. Admin verifies default currency symbol `$`, tax settings, and rotates payment webhook secret.
- **Acceptance Criteria & Verification:**
  - Configuration updates cleanly.

---

## Part 3: System Resilience & Error Scenarios (S01 - S04)

### Scenario S01: Page Not Found (404 Page)
- **User Story:** As a user navigating to an invalid URL, I want a clear explanation and links back to the catalog.
- **Action Flow:**
  1. User navigates to `/products/non-existent-uuid`.
  2. System renders `S01` with clear 404 message, search bar, and "Return to Store" button.

### Scenario S02: Server Error & Offline Recovery (500 Page)
- **User Story:** As a user encountering a transient backend disruption, I want clear guidance and an automatic retry option.
- **Action Flow:**
  1. Backend experiences a network timeout.
  2. System displays `S02` friendly error banner with countdown timer: "Retrying connection in 5 seconds...".

### Scenario S03: Session Expiry with Cart State Preservation
- **User Story:** As a customer whose session expired while shopping, I want to re-authenticate without losing my cart items.
- **Action Flow:**
  1. JWT refresh token expires after 7 days of inactivity.
  2. Modal `S03` opens over current checkout/cart screen: "Session expired. Enter your password to continue".
  3. User enters password; system re-authenticates and seamlessly retains current cart and checkout form inputs.

### Scenario S04: Real-time Concurrency / Stock Depletion Alert
- **User Story:** As a customer trying to checkout when another customer just bought the last unit, I want a truthful explanation and an updated cart.
- **Action Flow:**
  1. Customer A and Customer B both have the last laptop in their cart.
  2. Customer A completes payment first.
  3. Customer B clicks "Place Order"; backend returns 409 stock conflict.
  4. Modal `S04` displays: "Someone just bought the last item. We've updated your cart to the available quantity."
- **Acceptance Criteria & Verification:**
  - Customer B's cart item is updated or removed without crashing the UI, allowing them to proceed with remaining items.
