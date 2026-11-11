# 04 — Docker-Free Operational Scenarios (pgAdmin 4 + Redis-Free Runtime)

> **Purpose:** End-to-end operational walkthroughs showing how to provision, inspect, run, and debug the Commerce & Order Management Platform on Windows using **pgAdmin 4** and **In-Memory / Native Redis** with zero Docker dependencies.

---

## Scenario 1: Provisioning & Inspecting `commerce_dev` in pgAdmin 4

### Step 1: Verify Native Windows PostgreSQL Service
Open PowerShell and verify the local PostgreSQL Windows service is active on port `5432`:
```powershell
Get-NetTCPConnection -LocalPort 5432 -State Listen
```

### Step 2: Create `commerce_dev` in pgAdmin 4
1. Open **pgAdmin 4** $\rightarrow$ **Servers** $\rightarrow$ **PostgreSQL 16** $\rightarrow$ right-click **Databases** $\rightarrow$ **Create** $\rightarrow$ **Database...**
2. Enter `commerce_dev` and click **Save**.

### Step 3: Run Migrations & Seed Data
In the project root (`g:\2026\Projects\3030\Projects\commerce-order-management-platform`):
```powershell
npm run typeorm migration:run -- -d src/database/data-source.ts
npx ts-node src/database/seeds/initial-seed.ts
```

### Step 4: Verify Schema & Seeded Records in pgAdmin 4 Query Tool
Open **pgAdmin 4** $\rightarrow$ right-click **`commerce_dev`** $\rightarrow$ **Query Tool**, and run:
```sql
-- 1. Verify all 23 domain tables + migrations table exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verify seeded Admin User, Roles, and Permissions
SELECT
    u.email,
    u.status,
    r.name AS role_name,
    STRING_AGG(p.name, ', ') AS permissions
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
LEFT JOIN role_permissions rp ON rp.role_id = r.id
LEFT JOIN permissions p ON p.id = rp.permission_id
GROUP BY u.email, u.status, r.name;
```
**Expected Output in pgAdmin 4 Data Output Pane:**
| email | status | role_name | permissions |
| :--- | :--- | :--- | :--- |
| `admin@commerce.local` | `ACTIVE` | `ADMIN` | `inventory.update, catalog.manage` |

---

## Scenario 2: Starting the NestJS Server Without Docker Redis (`REDIS_ENABLED=false`)

### 2.1 What Happens Today (Before Fix) When Docker Redis is Stopped
If you delete Docker and run `npm run start:dev` today without Redis running on `127.0.0.1:6379`:
- `ioredis` in `src/redis/redis.module.ts:11` immediately attempts to connect to `127.0.0.1:6379` and floods the terminal with:
  `[ioredis] Unhandled error event: Error: connect ECONNREFUSED 127.0.0.1:6379`
- Calling `POST /api/v1/auth/login` hangs and fails with `500 Internal Server Error` when `AuthService.storeRefreshToken` calls `this.redisService.set(...)`.

### 2.2 What Happens After the Redis-Free Fallback (`REDIS_ENABLED=false`)
1. In `.env`, set:
   ```dotenv
   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/commerce_dev
   REDIS_ENABLED=false
   ```
2. Start the server:
   ```powershell
   npm run start:dev
   ```
3. **Startup Log Output:**
   ```text
   [Nest] LOG [RedisService] Running with In-Memory Key-Value Store (Docker-free / Redis-free mode)
   [Nest] LOG [NestApplication] Nest application successfully started on port 3000
   ```
4. Test Login -> Token Refresh -> Logout flow:
   - `POST /api/v1/auth/login` stores `refresh_token:<userId>` in `RedisService.memoryStore` with a 7-day expiration timestamp.
   - `POST /api/v1/auth/refresh` validates the token from `memoryStore` and rotates the token pair.
   - `POST /api/v1/auth/logout` deletes `refresh_token:<userId>` from `memoryStore`.

---

## Scenario 3: Live Order & Inventory Inspection in pgAdmin 4 During Checkout

With the NestJS application connected to local PostgreSQL (`commerce_dev`), you can monitor every step of the order lifecycle live in **pgAdmin 4**:

1. **Create a Product & Initial Stock** via `POST /api/v1/products` (with `initial_stock: 20, price: 99.99`).
2. **Add 3 Units to Cart & Checkout** via `POST /api/v1/orders/checkout`.
3. **Inspect Live Transaction Results in pgAdmin 4 Query Tool:**
   ```sql
   -- Check Order, Payment, and Inventory Reservation side-by-side in pgAdmin 4
   SELECT
       o.id AS order_id,
       o.status AS order_status,
       o.total_amount,
       oi.product_name_snapshot,
       oi.quantity AS ordered_qty,
       i.available_quantity,
       i.reserved_quantity
   FROM orders o
   JOIN order_items oi ON oi.order_id = o.id
   JOIN inventories i ON i.product_id = oi.product_id
   ORDER BY o.created_at DESC;
   ```
   - **Before Payment Webhook:** `order_status = 'PENDING'`, `available_quantity = 17`, `reserved_quantity = 3`.
   - **After `payment.succeeded` Webhook:** `order_status = 'PAID'`, `available_quantity = 17`, `reserved_quantity = 0`.
   - **After `payment.failed` Webhook:** `order_status = 'CANCELLED'`, `available_quantity = 20`, `reserved_quantity = 0`.
