# Project Codebase Review Plan & Tracker

Track your daily code review of `src/` modules in this commerce and order management platform. Check each item off as you complete the review.

---

## 📅 Day 1: Foundations & Infrastructure
> **Goal:** Understand database schema mappings, Redis caching/queuing mechanisms, and global HTTP pipes/filters.

- [x] **Database (`src/database/`)**
  - [x] [`src/database/entities/`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/database/entities) (Review all TypeORM entity schemas & relations)
  - [x] [`src/database/migrations/`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/database/migrations) (Inspect database migration history)
  - [x] [`src/database/data-source.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/database/data-source.ts) (TypeORM DataSource setup)
- [x] **Redis (`src/redis/`)**
  - [x] [`src/redis/redis.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/redis/redis.module.ts)
  - [x] [`src/redis/redis.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/redis/redis.service.ts)
- [x] **Common Cross-Cutting Concerns (`src/common/`)**
  - [x] Pipes, exception filters, interceptors, and decorators

---

## 📅 Day 2: Identity, Access & Permissions
> **Goal:** Review authentication flow (JWT + Refresh tokens in Redis), role assignments, and permission guards.

- [x] **Users Module (`src/users/`)**
  - [x] [`src/users/users.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/users/users.module.ts)
  - [x] [`src/users/users.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/users/users.service.ts)
  - [x] [`src/users/users.controller.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/users/users.controller.ts)
- [x] **Auth Module (`src/auth/`)**
  - [x] [`src/auth/auth.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/auth/auth.service.ts) (Password hashing, token generation, refresh tokens)
  - [x] [`src/auth/auth.controller.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/auth/auth.controller.ts) (Login, register, refresh, logout)
  - [x] [`src/auth/guards/`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/auth/guards) (`jwt-auth.guard.ts`, `roles.guard.ts`, `permissions.guard.ts`)
  - [x] [`src/auth/decorators/`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/auth/decorators) (`current-user.decorator.ts`, `roles.decorator.ts`, `permissions.decorator.ts`)

---

## 📅 Day 3: Catalog & Stock Management
> **Goal:** Understand product/category relationships, variant pricing, and stock reservation/concurrency control.

- [ ] **Catalog Module (`src/catalog/`)**
  - [ ] [`src/catalog/catalog.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/catalog/catalog.module.ts)
  - [ ] [`src/catalog/catalog.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/catalog/catalog.service.ts)
  - [ ] [`src/catalog/catalog.controller.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/catalog/catalog.controller.ts)
- [ ] **Inventory Module (`src/inventory/`)**
  - [ ] [`src/inventory/inventory.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/inventory/inventory.module.ts)
  - [ ] [`src/inventory/inventory.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/inventory/inventory.service.ts) (Optimistic locking / stock deductions)
  - [ ] [`src/inventory/inventory.controller.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/inventory/inventory.controller.ts)

---

## 📅 Day 4: Shopping & Pricing Engine
> **Goal:** Review cart state persistence, line-item price calculation, and coupon discount validation rules.

- [ ] **Cart Module (`src/cart/`)**
  - [ ] [`src/cart/cart.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/cart/cart.module.ts)
  - [ ] [`src/cart/cart.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/cart/cart.service.ts)
  - [ ] [`src/cart/cart.controller.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/cart/cart.controller.ts)
- [ ] **Coupons Module (`src/coupons/`)**
  - [ ] [`src/coupons/coupons.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/coupons/coupons.module.ts)
  - [ ] [`src/coupons/coupons.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/coupons/coupons.service.ts) (Expiry, minimum order, percentage vs fixed)
  - [ ] [`src/coupons/coupons.controller.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/coupons/coupons.controller.ts)

---

## 📅 Day 5: Orders & Financial Transactions
> **Goal:** Deep-dive into transactional checkout logic, order status state machine, and payment gateway webhooks.

- [ ] **Orders Module (`src/orders/`)**
  - [ ] [`src/orders/orders.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/orders/orders.module.ts)
  - [ ] [`src/orders/orders.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/orders/orders.service.ts) (Atomic checkout, cancellation, refunds)
  - [ ] [`src/orders/orders.controller.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/orders/orders.controller.ts)
- [ ] **Payments Module (`src/payments/`)**
  - [ ] [`src/payments/payments.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/payments/payments.module.ts)
  - [ ] [`src/payments/payments.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/payments/payments.service.ts) (Stripe payment intents, refunds)
  - [ ] [`src/payments/payments.controller.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/payments/payments.controller.ts) (Stripe webhook verification)

---

## 📅 Day 6: Fulfillment & Async Communications
> **Goal:** Inspect delivery tracking and asynchronous background email/event queues using BullMQ.

- [ ] **Shipping Module (`src/shipping/`)**
  - [ ] [`src/shipping/shipping.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/shipping/shipping.module.ts)
  - [ ] [`src/shipping/shipping.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/shipping/shipping.service.ts)
  - [ ] [`src/shipping/shipping.controller.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/shipping/shipping.controller.ts)
- [ ] **Notifications Module (`src/notifications/`)**
  - [ ] [`src/notifications/notifications.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/notifications/notifications.module.ts)
  - [ ] [`src/notifications/notifications.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/notifications/notifications.service.ts) (BullMQ queue producer & consumer)
  - [ ] [`src/notifications/notifications.processor.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/notifications/notifications.processor.ts)

---

## 📅 Day 7: Compliance, Quality & System Health
> **Goal:** Verify audit logging ledger, review moderation, and Terminus system health probes.

- [ ] **Audit Module (`src/audit/`)**
  - [ ] [`src/audit/audit.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/audit/audit.module.ts)
  - [ ] [`src/audit/audit.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/audit/audit.service.ts) (`logAction` append-only persistence)
- [ ] **Reviews Module (`src/reviews/`)**
  - [ ] [`src/reviews/reviews.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/reviews/reviews.module.ts)
  - [ ] [`src/reviews/reviews.service.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/reviews/reviews.service.ts)
  - [ ] [`src/reviews/reviews.controller.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/reviews/reviews.controller.ts) (Rating moderation & approvals)
- [ ] **Health Module (`src/health/`)**
  - [ ] [`src/health/health.module.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/health/health.module.ts)
  - [ ] [`src/health/health.controller.ts`](file:///g:/2026/Projects/3030/Projects/commerce-order-management-platform/src/health/health.controller.ts) (Database & Redis Terminus checks)
