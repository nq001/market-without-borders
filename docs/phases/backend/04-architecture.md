# Phase 04 — Hexagonal Architecture & ADRs

## Objective
Establish a clean hexagonal architecture (Ports & Adapters) isolating core multi-store business rules from delivery mechanisms and databases.

## Module Structure (`backend/src/`)
- `stores/`, `store-requests/`, `complaints/` (Tenancy & Governance)
- `users/`, `auth/` (Identity & RBAC)
- `catalog/`, `inventory/` (Catalog & Stock Concurrency)
- `cart/`, `coupons/` (Cart Grouping & Minor-Unit Pricing)
- `orders/`, `payments/`, `shipping/` (Fulfillment & Split Orders)
- `audit/`, `notifications/`, `health/` (Cross-cutting infrastructure)

## Core Architectural Decisions (ADRs)
- **ADR-001:** Modular Monolith over microservices to ensure ACID transaction boundaries during split checkouts.
- **ADR-002:** PostgreSQL 16 with pessimistic row-level locking (`SELECT FOR UPDATE`) for inventory deductions.
- **ADR-003:** In-memory fallback adapters for cache, locks, and event bus to ensure full local execution without external Docker dependencies.
