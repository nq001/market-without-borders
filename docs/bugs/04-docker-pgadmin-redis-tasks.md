# 04 — Docker Removal, pgAdmin 4 Setup & Redis-Free Migration Tasks

> **Objective:** Step-by-step actionable checklist (`[x]`) to remove all Docker artifacts, configure local PostgreSQL 16 + pgAdmin 4 on Windows, and update the NestJS application to run without Docker Redis.

---

## Phase 1: Remove Docker Files & Container References

- [x] **1.1 Delete Docker Configuration Files from Project Root**
  - [x] Delete `g:\2026\Projects\3030\Projects\commerce-order-management-platform\docker-compose.yml`
  - [x] Delete `g:\2026\Projects\3030\Projects\commerce-order-management-platform\docker-compose.prod.yml`
  - [x] Delete `g:\2026\Projects\3030\Projects\commerce-order-management-platform\Dockerfile`
  - [x] Delete `g:\2026\Projects\3030\Projects\commerce-order-management-platform\.dockerignore`

- [x] **1.2 Clean Up Environment & Database Configuration Files**
  - [x] Update `.env` with `REDIS_ENABLED=false` and local PostgreSQL connection string.
  - [x] Create `.env.example` documenting native Windows PostgreSQL (`5432`) and `REDIS_ENABLED=false` variables.
  - [x] Update `src/database/data-source.ts` default connection URL.

---

## Phase 2: Set Up Local PostgreSQL 16 & pgAdmin 4 on Windows

- [x] **2.1 Configure TypeORM DataSource for Local PostgreSQL + pgAdmin 4**
- [x] **2.2 Document `commerce_dev` and `commerce_test` Database Creation in pgAdmin 4**
- [x] **2.3 Verify TypeORM Migrations & Seed Script Readiness**

---

## Phase 3: Decouple Redis So the App Runs Without Docker Redis

- [x] **3.1 Make `REDIS_URL` Optional & Add `REDIS_ENABLED` Flag in `src/app.module.ts`**
  - [x] Update `Joi` validation schema in `src/app.module.ts` with `REDIS_ENABLED` (`default('false')`) and optional `REDIS_URL`.

- [x] **3.2 Update `src/redis/redis.module.ts` & `src/catalog/products/products.module.ts` to Support Redis-Free Mode**
  - [x] Return `null` for `'REDIS_CLIENT'` when `REDIS_ENABLED=false` so no `ECONNREFUSED 127.0.0.1:6379` errors occur when Docker is removed.
  - [x] Update `ProductsModule` `CacheModule.registerAsync` to use NestJS's built-in in-memory cache when `REDIS_ENABLED !== 'true'`.

- [x] **3.3 Implement In-Memory TTL Fallback in `src/redis/redis.service.ts`**
  - [x] Add `memoryStore` with TTL expiration support in `RedisService` and automatic fallback if Redis is disabled or unreachable.
