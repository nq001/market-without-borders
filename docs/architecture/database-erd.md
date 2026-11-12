# Architecture: Database Schema & ERD

## 1. Relational Database Design (PostgreSQL 16)

The schema enforces data integrity through foreign keys, check constraints, unique indexes, and audit timestamps.

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar approval_status
        varchar role
        timestamp created_at
    }

    STORES {
        uuid id PK
        varchar name UK
        varchar slug UK
        text description
        varchar status
        uuid owner_id FK
        timestamp created_at
    }

    CATEGORIES {
        uuid id PK
        varchar name
        varchar slug UK
        uuid parent_id FK
    }

    STORE_CATEGORIES {
        uuid store_id PK, FK
        uuid category_id PK, FK
    }

    PRODUCTS {
        uuid id PK
        varchar sku UK
        varchar name
        int price
        uuid category_id FK
        uuid store_id FK
        boolean is_active
        timestamp created_at
    }

    INVENTORIES {
        uuid product_id PK, FK
        int available_quantity
        int reserved_quantity
        int low_stock_threshold
    }

    STORE_EDIT_REQUESTS {
        uuid id PK
        uuid store_id FK
        varchar status
        jsonb requested_changes
        jsonb current_values
        text rejection_reason
        timestamp created_at
    }

    COMPLAINTS {
        uuid id PK
        uuid customer_id FK
        uuid store_id FK
        uuid order_id FK
        varchar reason
        text details
        varchar status
        varchar admin_action
        timestamp created_at
    }

    ORDERS {
        uuid id PK
        uuid user_id FK
        uuid store_id FK
        uuid parent_order_id FK
        varchar status
        int total_amount
        uuid coupon_id FK
        timestamp created_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        varchar product_name
        int unit_price
        int quantity
        int line_total
    }

    AUDIT_LOGS {
        uuid id PK
        uuid actor_id
        uuid store_id
        varchar action
        varchar entity
        inet ip_address
        jsonb diff
        timestamp timestamp
    }

    USERS ||--o{ STORES : "owns"
    STORES ||--o{ STORE_CATEGORIES : "linked"
    CATEGORIES ||--o{ STORE_CATEGORIES : "associates"
    STORES ||--o{ PRODUCTS : "catalogs"
    CATEGORIES ||--o{ PRODUCTS : "classifies"
    PRODUCTS ||--|| INVENTORIES : "stocks"
    STORES ||--o{ STORE_EDIT_REQUESTS : "requests"
    USERS ||--o{ COMPLAINTS : "files"
    STORES ||--o{ COMPLAINTS : "defends"
    USERS ||--o{ ORDERS : "places"
    STORES ||--o{ ORDERS : "fulfills (as child sub-order)"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    ORDERS ||--o{ ORDERS : "parent-suborder relationship"
```

