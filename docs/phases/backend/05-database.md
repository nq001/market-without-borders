# Phase 05 — PostgreSQL 16 Multi-Store Database Design

## Objective
Design and implement a relational PostgreSQL 16 database supporting multi-tenant isolation, parent-child order hierarchies, and dispute tracking.

## Relational Tables Implemented
- `stores`, `store_categories`, `store_edit_requests`, `complaints`
- `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `addresses`
- `categories`, `products`, `inventories`, `inventory_movements`
- `carts`, `cart_items`, `coupons`
- `orders`, `order_items`, `order_address_snapshots`, `idempotency_keys`
- `payments`, `payment_events`, `shipments`, `reviews`, `audit_logs`

## Key Constraints
- Unique indexes on `stores.slug` and `products.sku`.
- Pessimistic locking support on `inventories.product_id`.
- Referential integrity cascades for safe user deletion with optional store cascade.
