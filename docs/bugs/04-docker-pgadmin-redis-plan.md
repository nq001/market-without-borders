# 04 — Removing Docker, Using pgAdmin 4 for PostgreSQL, and Running Without Docker Redis

> **Scope:** Complete architectural and operational plan to remove Docker (`Dockerfile`, `docker-compose.yml`, `docker-compose.prod.yml`, `.dockerignore`), run PostgreSQL natively on Windows managed through **pgAdmin 4**, and handle **Redis without Docker** cleanly on Windows.

---

## 1. Can We Delete Docker Completely?

**Yes — 100%.**
Nothing in the NestJS application code (`src/`) requires Docker at runtime. The application only connects to:
1. **PostgreSQL** via a standard TCP connection string (`DATABASE_URL=postgres://<user>:<password>@127.0.0.1:5432/commerce_dev`).
2. **Redis** via `REDIS_URL=redis://127.0.0.1:6379` (which is only used in **two** places in the entire codebase: `src/auth/auth.service.ts` for storing refresh tokens, and `src/catalog/products.controller.ts` for NestJS `CacheModule`, which already uses an in-memory cache by default in `src/catalog/catalog.module.ts:13`!).

### 1.1 Impact Analysis of Deleting Docker Files

| File to Delete / Update | Role Today | Action Required |
| :--- | :--- | :--- |
| `docker-compose.yml` | Spins up `postgres:16-alpine` (mapped to host port `5433`) and `redis:7-alpine` (port `6379`). | **Delete file.** Use native Windows PostgreSQL (port `5432`) managed via pgAdmin 4. |
| `docker-compose.prod.yml` | Production container orchestration file. | **Delete file.** |
| `Dockerfile` | Multi-stage Node 20 container image build. | **Delete file.** Run directly with Node.js (`npm run start:dev` / `npm run build && npm run start:prod`). |
| `.dockerignore` | Ignore rules for Docker build context. | **Delete file.** |
| `.env` | Currently uses port `5433` (`postgres://postgres:postgres@127.0.0.1:5433/commerce_dev`) because Docker mapped `5433:5432`. | **Update `.env`** to point to native PostgreSQL port `5432` and your local `postgres` password set during PostgreSQL/pgAdmin installation. |
| `src/database/data-source.ts` | Fallback URL points to `127.0.0.1:5433`. | **Update** fallback port to `5432` (and load from `.env`). |
| `test-db.js` | Scratch script testing ports `5432` and `5433`. | **Delete or update** to verify native PostgreSQL connection. |
| `README.md` & `docs/reports/04-operations/docker.md` | Documents `docker-compose up -d`. | **Update documentation** to show native PostgreSQL + pgAdmin 4 setup. |

---

## 2. Replacing Docker PostgreSQL with Local PostgreSQL 16 + pgAdmin 4

### 2.1 Installing PostgreSQL & pgAdmin 4 on Windows
1. Download the official Windows installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) (PostgreSQL 16.x).
2. In the installation wizard, ensure the following components are checked:
   - **PostgreSQL Server** (runs automatically as a native Windows background service `postgresql-x64-16` on port `5432`)
   - **pgAdmin 4** (GUI management tool)
   - **Command Line Tools** (`psql`, `pg_dump`, `pg_restore`)
3. Set the superuser (`postgres`) password (e.g., `postgres` for local development) and keep the default port **`5432`**.

### 2.2 Step-by-Step Database Setup in pgAdmin 4 GUI

```mermaid
flowchart LR
  A["Open pgAdmin 4"] --> B["Expand Servers > PostgreSQL 16"]
  B --> C["Right-click Databases > Create > Database..."]
  C --> D["Create 'commerce_dev'\n(Owner: postgres, UTF8)"]
  D --> E["Create 'commerce_test'\n(for E2E tests)"]
  E --> F["Run TypeORM Migrations & Seed"]
  F --> G["Inspect 23 Tables & ERD in pgAdmin 4"]
```

1. **Launch pgAdmin 4** from the Windows Start Menu.
2. In the left **Object Explorer** tree, expand **Servers** $\rightarrow$ **PostgreSQL 16** and enter your `postgres` password.
3. **Create the Development Database (`commerce_dev`):**
   - Right-click **Databases** $\rightarrow$ **Create** $\rightarrow$ **Database...**
   - **General Tab:**
     - **Database:** `commerce_dev`
     - **Owner:** `postgres`
   - **Definition Tab:**
     - **Encoding:** `UTF8`
   - Click **Save**.
4. **Create the Test Database (`commerce_test`)** (for running `npm run test:e2e`):
   - Right-click **Databases** $\rightarrow$ **Create** $\rightarrow$ **Database...**
   - **Database:** `commerce_test` $\rightarrow$ Click **Save**.
5. **Enable `uuid-ossp` Extension in pgAdmin 4 (Optional pre-check):**
   - Right-click `commerce_dev` $\rightarrow$ **Query Tool**, run:
     ```sql
     CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
     ```
     *(Note: The initial migration `1710420000000-InitialSchema.ts` also runs this automatically).*

### 2.3 Connecting the NestJS Project to pgAdmin's PostgreSQL Instance

Update `.env` in the project root:
```dotenv
NODE_ENV=development
PORT=3000

# Native Windows PostgreSQL (managed via pgAdmin 4 on default port 5432)
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/commerce_dev

# Redis configuration (see Section 3 below for Redis-free mode!)
REDIS_ENABLED=false
REDIS_URL=redis://127.0.0.1:6379

JWT_ACCESS_SECRET=super_secret_jwt_key_dev_123456
JWT_REFRESH_SECRET=super_secret_refresh_key_dev_123456
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PAYMENT_WEBHOOK_SECRET=dev_webhook_secret_1234567890
```

Run migrations and seed data:
```powershell
npm run typeorm migration:run -- -d src/database/data-source.ts
npx ts-node src/database/seeds/initial-seed.ts
```

In **pgAdmin 4**, expand **Databases** $\rightarrow$ **`commerce_dev`** $\rightarrow$ **Schemas** $\rightarrow$ **`public`** $\rightarrow$ **Tables** (right-click **Refresh**):
- You will see all **23 tables** (`users`, `roles`, `permissions`, `products`, `inventories`, `orders`, `payments`, `shipments`, etc.).
- Right-click `commerce_dev` $\rightarrow$ **ERD for Database** to view the interactive visual Entity-Relationship Diagram inside pgAdmin 4!

---

## 3. How to Deal with Redis Without Docker on Windows

### 3.1 Where is Redis Actually Used in `src/`?
Let's inspect every occurrence of Redis in the codebase:
1. **`src/redis/redis.module.ts` & `src/redis/redis.service.ts`**:
   - Instantiates an `ioredis` client using `REDIS_URL` and exposes `get(key)`, `set(key, value, ttlSeconds)`, and `del(key)`.
2. **`src/auth/auth.service.ts:40, 58, 100`**:
   - Stores, reads, and deletes `refresh_token:${userId}` strings with a 7-day TTL.
3. **`src/catalog/catalog.module.ts:13`**:
   - Uses `CacheModule.register({ ttl: 60000 })` — **this already uses NestJS's built-in in-memory cache**, NOT Redis!

This means `src/redis/redis.service.ts` is only used as a simple key-value store (`get`, `set`, `del`) with TTL!

---

### 3.2 Four Concrete Options for Running Without Docker Redis on Windows

| Option | External Install Needed? | Best For | How It Works |
| :--- | :---: | :--- | :--- |
| **Option A (Recommended Default): Dual-Mode `RedisService` with Automatic In-Memory TTL Fallback** | **None (Zero install)** | Instant local Windows development (`npm run start:dev` works immediately after installing PostgreSQL + pgAdmin) | When `REDIS_ENABLED=false` (or Redis is unreachable), `RedisService` uses an internal `Map<string, { value: string; expiresAt?: number }>` in Node.js memory. Zero external processes required! |
| **Option B: PostgreSQL-Backed Token Store (100% pgAdmin Managed)** | **None (Uses your PostgreSQL DB)** | Persisting refresh tokens across server restarts without running Redis at all | Stores `refresh_token:${userId}` inside PostgreSQL (which you can view and revoke directly inside **pgAdmin 4**!). |
| **Option C: Native Windows Redis Service (Memurai Developer or Redis for Windows)** | Native `.msi` Windows Service | Testing real `ioredis` TCP protocol locally on Windows without Docker | Install **Memurai Developer Edition** or **Redis-Windows** (`winget install Redis.Redis` / `Memurai.MemuraiDeveloper`), which runs natively as a Windows Service on `127.0.0.1:6379`. |
| **Option D: Free Cloud Redis (Upstash / Redis Cloud)** | None (Cloud URL) | Shared staging/team environments | Set `REDIS_URL=rediss://default:<password>@<endpoint>.upstash.io:6379` in `.env`. |

---

### 3.3 Recommended Implementation: Option A + Option B/C Support in `src/redis/`

By upgrading `src/redis/redis.module.ts` and `src/redis/redis.service.ts` to support `REDIS_ENABLED=false` (with automatic fallback to an in-memory TTL store), the application works out-of-the-box on Windows **with only PostgreSQL + pgAdmin 4 installed**, while still supporting a native Windows Redis service (`REDIS_ENABLED=true`) whenever desired!

#### Target Code for `src/redis/redis.service.ts` (Docker-Free Compatible):
```typescript
import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

interface MemoryEntry {
  value: string;
  expiresAt: number | null;
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly memoryStore = new Map<string, MemoryEntry>();

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis | null) {
    if (!this.redisClient) {
      this.logger.log('Running with In-Memory Key-Value Store (Docker-free / Redis-free mode)');
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.redisClient) {
      return this.redisClient.get(key);
    }
    const entry = this.memoryStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.redisClient) {
      if (ttlSeconds) {
        await this.redisClient.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.redisClient.set(key, value);
      }
      return;
    }
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryStore.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.del(key);
      return;
    }
    this.memoryStore.delete(key);
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
    this.memoryStore.clear();
  }
}
```

#### Target Code for `src/redis/redis.module.ts`:
```typescript
@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const enabled = configService.get<string>('REDIS_ENABLED', 'false') === 'true';
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!enabled || !redisUrl) {
          return null; // Uses in-memory fallback in RedisService
        }
        return new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 3 });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
```

And in `src/app.module.ts:34-41`, update the `Joi` schema so `REDIS_URL` is optional when `REDIS_ENABLED=false`:
```typescript
validationSchema: Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  REDIS_ENABLED: Joi.boolean().default(false),
  REDIS_URL: Joi.string().optional(),
}),
```
