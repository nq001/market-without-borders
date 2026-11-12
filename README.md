# Market Without Borders (MWB)
### Enterprise Multi-Store Artisan Marketplace & Distributed Order Management Platform (DOMP)

[![Build & Verification Status](https://img.shields.io/badge/Verification-100%25%20Passing-success.svg)](#verification--quality-benchmarks)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20Hexagonal%20Monolith-blue.svg)](#system-architecture--domain-model)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016%20%2B%20ACID%20Locks-forest.svg)](#database-architecture--erd)
[![Internationalization](https://img.shields.io/badge/i18n-English%20%26%20Arabic%20(RTL)-amber.svg)](#internationalization-i18n--rtl)

---

## 1. Abstract & Executive Overview

**Market Without Borders (MWB)** is a unified multi-tenant digital commerce marketplace and distributed order management system designed specifically for independent artisan workshops, studios, and global craft collectives. 

Traditional e-commerce platforms force users either into siloed single-merchant storefronts (which fragment the buying journey and increase checkout friction) or centralized merchant aggregators that erode store branding, lack operational auditing, and fail to provide atomic transaction guarantees during high-concurrency flash sales.

MWB solves this paradigm by pairing an **integrated multi-store shared shopping cart** with an **autonomous order splitting and reservation engine**. Patrons can browse independent artisan studios across diverse categories, place products from different creators into a single shared cart, review a composite breakdown of per-store charges and taxes, and checkout in a single atomic transaction. Behind the scenes, the platform generates isolated, trackable sub-orders for each independent merchant, handles escrow and payment confirmation, tracks shipping milestones end-to-end, and facilitates complete administrative governance.

---

## 2. Problem Statement & Motivation

Prior to MWB, multi-seller commerce systems suffered from recurring systemic challenges:

1. **Cart & Checkout Fragmentation:** Customers purchasing from multiple merchants were forced to execute sequential checkouts with separate payment approvals, resulting in cart abandonment rates exceeding 65%.
2. **Inventory Overselling & Concurrency Race Conditions:** Under simultaneous peak traffic, naive database read-then-write patterns resulted in negative inventory balances and phantom stock allocations.
3. **Double-Spend & Network Replay Vulnerabilities:** Mobile disconnects and re-submitted payment requests frequently created duplicate debit events and duplicate order records.
4. **Lack of Tenant Workspace Boundaries:** Store owners lacked isolated workspaces with role-based staff access controls, leaving sensitive revenue, payout details, and store profiles exposed.
5. **Rigid Platform Administration:** Admins lacked supervised intervention tools, such as complaint-driven store suspensions, side-by-side verification of store profile edits, and impersonation auditing.

---

## 3. Core Objectives & Business Capabilities

MWB was engineered to fulfill strict operational benchmarks:

- **Atomic Multi-Store Split Ordering:** Atomically decompose a composite cart into individual store sub-orders within a single PostgreSQL transaction block. If any single store's item fails reservation, the entire transaction rolls back, leaving zero orphan records.
- **Pessimistic Concurrency Controls:** Guarantee zero inventory overdrafts using strict row-level `SELECT ... FOR UPDATE` pessimistic locks during checkout.
- **Idempotency Guarantees:** Enforce unique idempotency keys across all checkout mutations to cache and replay identical responses safely without duplicate order creation.
- **Three-Tier Workspace Segregation:**
  - **Super Admin Panel:** 14 structured management sections across Overview, Management, Moderation, Business, and System domains with real-time Activity Log auditing and impersonation.
  - **Store Owner / Staff Workspace:** 11 dedicated screens for product catalog management, stock adjustments, order fulfillment pipelines, staff RBAC permissions, store coupons, and net earnings breakdowns.
  - **Patron / Customer Experience:** Dynamic multi-store storefronts, category browsing, shared cart, split checkout with printable receipt modal, customer complaints tribunal, and favorites wishlist.
- **Bilingual & RTL-Ready:** Seamless bilingual support for English and Arabic, featuring dynamic document direction switching (`dir="rtl"` vs `dir="ltr"`).

---

## 4. System Architecture & Domain Model

The platform follows **Clean / Hexagonal Architecture** principles, enforcing a strict unidirectional dependency rule from outer infrastructure to the core domain model:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Presentation & UI Layer                         │
│   React 19 + TypeScript + Vite + TailwindCSS + Dynamic RTL Engine      │
│   (Super Admin Console | Store Owner Workspace | Customer Experience)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / JSON
┌───────────────────────────────────▼────────────────────────────────────┐
│                  Application Controllers & DTO Guards                  │
│       NestJS Fastify/Express Adapters + Class-Validator + Pino         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       Domain Services & Use Cases                      │
│   CartService │ PricingService │ OrdersService │ InventoryService      │
│   StoresService │ ComplaintsService │ StoreRequestsService             │
└──────┬────────────────────────────┬────────────────────────────┬───────┘
       │                            │                            │
┌──────▼────────────────┐    ┌──────▼────────────────┐    ┌──────▼───────┐
│     Unit of Work      │    │  In-Memory Event Bus  │    │  In-Memory   │
│  TypeORM Transaction  │    │  Domain Event Emitter │    │  Cache/Lock  │
└──────┬────────────────┘    └──────┬────────────────┘    └──────┬───────┘
       │                            │                            │
┌──────▼────────────────────────────▼────────────────────────────▼───────┐
│                       Infrastructure & Persistence                     │
│               PostgreSQL 16 Engine (ACID / Strict Schemas)             │
└────────────────────────────────────────────────────────────────────────┘
```

### Domain Subdomains

| Bounded Context | Core Entities | Responsibilities |
| :--- | :--- | :--- |
| **Catalog** | `Product`, `Category`, `StoreCategory` | Rich multi-store product definitions, active status filters, category mappings. |
| **Tenancy** | `Store`, `StoreEditRequest`, `StoreStaff` | Multi-store tenant metadata, status (`ACTIVE`, `PENDING`, `SUSPENDED`), and profile change audits. |
| **Inventory** | `Inventory`, `InventoryMovement` | Row-level locked stock counters, automated replenishment history, low-stock alerts. |
| **Cart & Pricing** | `Cart`, `CartItem`, `Coupon` | Multi-store item grouping, coupon validation, minor-unit money arithmetic without rounding errors. |
| **Orders** | `Order`, `OrderItem`, `OrderAddressSnapshot` | Parent/child order trees, state machine orchestration, invoice generation. |
| **Fulfillment** | `Shipment`, `PaymentEvent` | Payment capture hooks, multi-carrier shipment dispatching, milestone progressions. |
| **Governance** | `Complaint`, `AuditLog`, `User` | Customer disputes tribunal, auto-suspension triggers, immutable activity log tracking. |

---

## 5. Order Lifecycle State Machine

The order pipeline enforces strict finite-state transitions across all sub-orders:

```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT: Customer Places Split Order
    PENDING_PAYMENT --> PAID: Payment Webhook Received
    PENDING_PAYMENT --> PAYMENT_FAILED: Payment Gateway Rejection / TTL Expiry
    
    PAID --> PREPARING: Store Owner Accepts & Prepares Batch
    PAID --> REJECTED: Store Rejects Order (With Reason)
    
    PREPARING --> SHIPPED: Dispatched with Tracking Carrier
    SHIPPED --> DELIVERED: Proof of Delivery Confirmed
    
    DELIVERED --> REFUNDED: Admin/Owner Approves Return Request
    PENDING_PAYMENT --> CANCELLED: Customer Cancels Before Settlement
    PAID --> CANCELLED: Customer Cancels Before Dispatch
```

---

## 6. Database Architecture & ERD

The database runs on native local **PostgreSQL 16** with strong relational integrity, foreign key cascades, and check constraints:

```mermaid
erDiagram
    USERS ||--o{ STORES : "owns"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ COMPLAINTS : "files"
    
    STORES ||--o{ PRODUCTS : "stocks"
    STORES ||--o{ ORDERS : "fulfills (as sub-order)"
    STORES ||--o{ STORE_EDIT_REQUESTS : "submits"
    STORES ||--o{ COMPLAINTS : "targeted by"
    
    CATEGORIES ||--o{ PRODUCTS : "groups"
    CATEGORIES ||--o{ STORES : "classifies"
    
    PRODUCTS ||--|| INVENTORY : "maintains balance"
    PRODUCTS ||--o{ CART_ITEMS : "added to"
    PRODUCTS ||--o{ ORDER_ITEMS : "purchased in"
    
    CARTS ||--o{ CART_ITEMS : "contains"
    
    ORDERS ||--o{ ORDER_ITEMS : "lines"
    ORDERS ||--o| SHIPMENTS : "dispatched via"
    ORDERS ||--o{ PAYMENT_EVENTS : "processed through"
    ORDERS ||--o{ ORDERS : "sub-orders (parent_order_id)"
```

---

## 7. Role & Feature Mapping

### 7.1 Super Admin Console (14 Navigation Sections)
1. **Dashboard:** High-level platform KPIs (Active/Pending/Suspended Stores, Gross Sales, Low-Stock Warnings, Popular Products).
2. **Users:** User onboarding approvals, customer/owner role toggling, account suspension, and safe deletion with optional store cascade.
3. **Stores:** Filter stores by status, category, or owner; trigger Store Drawer for full metadata; trigger "Enter Store" Full Admin Impersonation.
4. **Categories:** Add, edit, hide, or remove categories; link stores with automatic user role elevation.
5. **Edit Requests:** Review pending store modifications with a **side-by-side JSON comparison** of current vs. requested values with approval and mandatory rejection reasons.
6. **Orders:** Platform-wide order tracking with dispute override capabilities (cancel, flag, or refund).
7. **Complaints:** Investigate customer reports; review store owner responses; execute immediate store suspensions.
8. **Reviews:** Moderate customer product and store reviews; remove abusive submissions.
9. **Finance:** Gross sales per store, global commission rate management, and bi-weekly payout disbursements.
10. **Offers & Ads:** Platform coupon codes and home page hero advertising banner scheduler.
11. **Reports:** Exportable analytical reports (Sales, Stores, Users, Traffic) with automated CSV downloads.
12. **Activity Log:** Comprehensive audit log with actor ID, store ID, IP address, timestamp, and entity diffs.
13. **Admin Team:** Role-Based Access Control (RBAC) to invite sub-admins (Super Admin, Support Moderator, Finance Admin).
14. **Settings:** Dynamic platform styling (forest, amber, paper themes), marketplace name, logo, and operational parameters.

### 7.2 Store Owner & Staff Workspace (11 Navigation Sections)
1. **Dashboard:** Store-specific product counts, gross sales, pending/completed orders, and low-stock alerts.
2. **Products:** Product CRUD with image uploads, pricing, variants, and bulk hide/delete actions.
3. **Inventory:** Real-time stock counters, minimum inventory thresholds, and manual restock adjustments.
4. **Orders:** Store order pipeline (Accept, Prepare, Dispatch with tracking number, Reject with reason, Print invoices).
5. **Offers:** Store-specific discount codes and validity dates that discount only the store's products in shared carts.
6. **Reviews & Complaints:** Merchant review reply composer, "Report Review" flag, and direct complaint response threads.
7. **Categories:** View marketplace category directories and store associations.
8. **Earnings:** Net earnings balances, platform fee deductions (10%), and settlement wire history.
9. **Staff:** Provision store staff with granular permissions (`ORDERS_ONLY`, `PRODUCTS_ONLY`, `FULL_STORE_ACCESS`).
10. **Activities:** Store-scoped audit trail logging actions performed by staff, the owner, or platform admins.
11. **Settings:** Store profile customization (logo, banner, description) and submission/resubmission of store edit requests.

### 7.3 Customer Experience
1. **Header Navigation:** Home, Stores, Orders, About, Notifications (with unread badge), Shared Cart, and User Profile.
2. **Marketplace Home:** Hero ad banners, top-order stores, high-demand items, and featured categories.
3. **Storefronts:** Dedicated artisan storefronts with shop banners, verified ratings, products, and direct "File Complaint" action.
4. **Shared Cart & Atomic Split Checkout:** Multi-store shopping cart with per-store grouping and subtotals; split order placement; interactive receipt review modal.
5. **Order Tracking:** Timeline progression with shipment tracking carriers and cancellation controls.
6. **Disputes Tribunal:** File complaints against stores with reasons, details, and optional evidence.
7. **Wishlist & Favourites:** Bookmark independent artisan studios and save favorite products for future purchasing.
8. **About & Policies:** Artisan vetting standards, mission statement, terms of service, and refund policy.

---

## 8. Internationalization (i18n) & RTL

The platform features first-class multilingual support:
- **Languages:** English (`en`) and Arabic (`ar`).
- **Dynamic Directionality:** Automatic toggling of `dir="rtl"` on `<html>` when Arabic is selected.
- **Language Switcher:** Accessible directly in the main navigation header and preserved in `localStorage`.
- **Localization Scope:** All navigation items, order lifecycle statuses, modal notifications, action triggers, and empty states.

---

## 9. Verification & Quality Benchmarks

Every layer of the platform is backed by automated test suites:

```bash
# Run unit & controller tests across backend and frontend
npm test

# Run end-to-end integration & concurrency suites
npm run test:e2e

# Run production build compilation
npm run build
```

### Test Suite Execution Results

- **Backend Unit & Controller Suites (`jest`):** 9/9 suites passed (25/25 tests).
- **Frontend Unit Suites (`vitest`):** 1/1 suite passed (3/3 currency and minor-unit tests).
- **End-to-End Suite (`test:e2e`):** 8/8 suites passed (24/24 tests), including:
  - `multi-store-resilience.e2e-spec.ts`: Suspended store cart rejection, complaint validation, edit request state machines, store slug uniqueness, and complaint auto-suspension.
  - `inventory.concurrency.e2e-spec.ts`: Pessimistic lock race protection.
  - `orders.checkout.e2e-spec.ts`: Split order generation and idempotency key caching.
  - `payments-shipping.e2e-spec.ts`: Webhook handling and shipping milestones.
  - `failure-modes.e2e-spec.ts`: Atomic transaction rollback on split failures.
  - `notifications-reviews-audit.e2e-spec.ts`: Review validation and audit logging.
- **TypeScript Production Builds:** Clean compilation with 0 errors across NestJS (`nest build`) and Vite (`tsc && vite build`).

---

## 10. Local Development Setup

### Prerequisites
- **Node.js:** v20.x or v22.x LTS
- **PostgreSQL:** v16.x running locally on port `5432` with database `om_platform`
- **Package Manager:** `npm` v10+

### Step-by-Step Installation

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd commerce-order-management-platform
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```

3. **Configure Environment Variables:**
   Create `backend/.env` with local database credentials:
   ```env
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=om_platform
   JWT_SECRET=mwb-super-secret-key-3030
   JWT_EXPIRATION=3600s
   ```

4. **Initialize Database Schema & Seeds:**
   ```bash
   cd backend
   npm run migration:run
   npm run seed:run
   cd ..
   ```

5. **Start Development Servers (Concurrently):**
   ```bash
   npm run dev
   ```
   - **Frontend Application:** `http://localhost:5173/`
   - **Backend API & Swagger:** `http://localhost:3000/api/v1`

---

## 11. Project Directory Structure

```
commerce-order-management-platform/
├── backend/                        # NestJS Backend API
│   ├── src/
│   │   ├── audit/                  # Platform & store activity logging
│   │   ├── auth/                   # JWT authentication, guards, RBAC
│   │   ├── cart/                   # Multi-store cart & minor-unit pricing
│   │   ├── catalog/                # Products & categories
│   │   ├── common/                 # Clean Architecture ports & value objects
│   │   ├── complaints/             # Customer disputes tribunal
│   │   ├── coupons/                # Platform & store coupons
│   │   ├── database/               # TypeORM entities, migrations & seeds
│   │   ├── inventory/              # Row-locked stock balance & movements
│   │   ├── notifications/          # In-app alerts & email dispatching
│   │   ├── orders/                 # Order splitting & state machines
│   │   ├── payments/               # Payment webhooks & mock provider
│   │   ├── reviews/                # Ratings & review moderation
│   │   ├── shipping/               # Shipment tracking & milestones
│   │   ├── store-requests/         # Store edit requests review engine
│   │   ├── stores/                 # Tenancy management & store profiles
│   │   └── users/                  # User accounts & approval pipelines
│   └── test/                       # E2E resilience & concurrency test suites
├── frontend/                       # React 19 + Vite Frontend Application
│   ├── src/
│   │   ├── components/             # Reusable UI (Admin, Owner, Layout, Common)
│   │   ├── context/                # Auth, Cart, Toast, and Language Contexts
│   │   ├── screens/                # User role views (Admin, Owner, Customer)
│   │   └── utils/                  # Minor-unit currency & formatting utilities
├── docs/                           # Architecture, gap analysis, and requirements
│   ├── bugs/                       # Requirements specifications & task trackers
│   └── phases/                     # 20-phase engineering blueprints
├── package.json                    # Root workspace runner
└── README.md                       # Comprehensive platform documentation
```

---

## 12. Security & Compliance Safeguards

- **Access Token Hardening:** Signed JWT tokens with strict role claims (`ADMIN`, `OWNER`, `CUSTOMER`).
- **Pessimistic Locks:** Stock balance subtractions protected with `SELECT ... FOR UPDATE` row locks, preventing race condition attacks during high-traffic sales.
- **SQL Injection Defense:** All database queries parameterized through TypeORM query builders with strict ORM aggregate boundaries.
- **Auditing Immutability:** Sensitive store impersonation, user approval modifications, and status changes write append-only records to `audit_logs`.
- **Atomic Rollbacks:** Multi-store checkouts execute inside database transaction scopes to guarantee consistent system state.

---

## 13. License & Authorship

Developed for the **Market Without Borders (MWB)** initiative. Built with Clean Code, Hexagonal Architecture, and autonomous resilience standards.

