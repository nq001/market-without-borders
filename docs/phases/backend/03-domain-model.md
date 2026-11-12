# Phase 03 — Multi-Store Domain Modeling

## Objective
Design the domain aggregates, value objects, and lifecycle state machines for multi-merchant commerce.

## Core Aggregates
- **`Store`:** Multi-tenant workspace aggregate with slug uniqueness, categories, and status transitions.
- **`StoreEditRequest`:** Finite state machine managing owner edit submissions, admin side-by-side verification, and resubmission rules.
- **`Complaint`:** Customer dispute aggregate tracking complaints against stores, owner responses, and admin resolution actions (`NONE`, `WARNING_ISSUED`, `STORE_SUSPENDED`).
- **`Order`:** Composite tree aggregate managing parent orders, store sub-orders, and immutable price snapshots.
- **`Inventory`:** Stock aggregate with row-level pessimistic concurrency constraints.

## State Machines
- **Order Lifecycle:** `PENDING_PAYMENT` → `PAID` → `PREPARING` → `SHIPPED` → `DELIVERED` (with terminal states `CANCELLED`, `REJECTED`, `REFUNDED`).
- **Store Edit Requests:** `PENDING` → `APPROVED` | `REJECTED` → `RESUBMITTED`.
- **User Onboarding:** `PENDING_APPROVAL` → `ACTIVE` | `SUSPENDED` | `REJECTED`.
