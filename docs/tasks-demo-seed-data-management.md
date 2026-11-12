# Demo Seed Data & Mock Database Management Guide

## 1. Overview & Purpose
To enable instant, zero-latency showcase deployments on hosting platforms like **Vercel** without requiring an active PostgreSQL database instance or dealing with cloud cold-starts, a complete client-side in-memory mock database was introduced.

This mock layer allows recruiters, visitors, and evaluators to test all marketplace features (multi-store directory, artisan storefronts, cart, admin screens, user approvals, dispute handling, Arabic/English RTL toggle) with 100% reliability and speed.

---

## 2. Environment Variable Control (`.env`)

The system is controlled via a single environment variable in `frontend/.env`:

```env
# Set to 'true' to use instant client-side mock/seed database (ideal for Vercel demo)
# Set to 'false' to connect directly to the live NestJS + PostgreSQL backend API
VITE_USE_MOCK_DATA=true
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Behavior Matrix:
| `VITE_USE_MOCK_DATA` Value | Data Source | Behavior |
| :--- | :--- | :--- |
| **`true` (or unset)** | `frontend/src/data/mockDatabase.ts` | Uses 10 pre-loaded artisan stores, users, orders, and products. Shows "Live Demo Mode" banner in header. |
| **`false`** | Live Backend (`VITE_API_BASE_URL`) | Directly issues `fetch()` HTTP requests to NestJS `/api/v1/...` endpoints connected to PostgreSQL. Hides demo banner. |

---

## 3. Inventory of Created & Modified Files

### Created Files:
1. `frontend/src/data/mockDatabase.ts`:
   - Single central database file containing 10 stores, users (admins, store owners, customers), products, categories, split orders, complaints, store edit requests, and coupons.
2. `frontend/.env`:
   - Active environment file with `VITE_USE_MOCK_DATA=true`.
3. `frontend/.env.example`:
   - Environment documentation template for developers.
4. `docs/tasks-demo-seed-data-management.md`:
   - This documentation file.

### Modified Files:
1. `frontend/src/api/client.ts`:
   - Added conditional switching based on `isMockDataEnabled` (`VITE_USE_MOCK_DATA`).
2. `frontend/src/screens/StoresDirectoryScreen.tsx`:
   - Dynamically renders all 10 artisan stores and category filters from `mockDatabase.ts`.
3. `frontend/src/screens/admin/AdminStoresScreen.tsx`:
   - Pre-loads all 10 stores with sales and status data for admin testing.
4. `frontend/src/screens/admin/AdminUsersScreen.tsx`:
   - Pre-loads multi-role users (Super Admin, 10 Store Owners, Customers) for approval management.
5. `frontend/src/components/layout/Header.tsx`:
   - Displays dynamic announcement banner indicating "Live Demo Mode" when active.

---

## 4. How to Switch to Live Database Backend (Without Deleting Files)

When you are ready to connect the frontend to your running NestJS backend and PostgreSQL database:

1. Open `frontend/.env`:
   ```env
   VITE_USE_MOCK_DATA=false
   VITE_API_BASE_URL=https://your-production-backend-url.com/api/v1
   ```
2. Rebuild or restart the frontend dev server:
   ```powershell
   npm --prefix frontend run build
   ```
3. The application will instantly switch to live API calls without any code refactoring required.

---

## 5. Checklist to Permanently Remove Mock Seed Data (Future Clean-Up)

If you decide in the future to completely purge mock data and leave only live backend integrations:

- [ ] **Step 1:** Delete `frontend/src/data/mockDatabase.ts`:
  ```powershell
  Remove-Item -Force frontend/src/data/mockDatabase.ts
  ```
- [ ] **Step 2:** In `frontend/src/api/client.ts`:
  - Remove imports of `MOCK_STORES`, `MOCK_USERS`, etc.
  - Remove `isMockDataEnabled` branch logic and retain only the `fetch()` calls.
- [ ] **Step 3:** In `frontend/src/screens/StoresDirectoryScreen.tsx`:
  - Replace direct `MOCK_STORES` imports with a `useEffect` call to `fetchStores()`.
- [ ] **Step 4:** In `frontend/src/screens/admin/AdminStoresScreen.tsx` and `AdminUsersScreen.tsx`:
  - Fetch stores and users via `fetchStores()` and `fetchUsers()` inside `useEffect`.
- [ ] **Step 5:** In `frontend/src/components/layout/Header.tsx`:
  - Remove `isMockDataEnabled` import and retain only the standard announcement text.
- [ ] **Step 6:** In `frontend/.env`:
  - Remove `VITE_USE_MOCK_DATA=true`.
- [ ] **Step 7:** Run tests and build check:
  ```powershell
  npm test
  npm run build
  ```
- [ ] **Step 8:** Delete this task file `docs/tasks-demo-seed-data-management.md`.
