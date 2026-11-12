# Implementation Phases Directory

The implementation documentation for the Market Without Borders (MWB) platform is cleanly segregated by architectural tier:

```
docs/phases/
├── backend/    # 20 Engineering stages for NestJS + PostgreSQL + TypeORM backend
└── frontend/   # 6 UI/UX implementation stages for React 19 + Vite + TailwindCSS frontend
```

---

## 📁 [Backend Phases (`docs/phases/backend/`)](./backend/README.md)
Contains the 20 implementation stages governing the distributed commerce backend, from product discovery and domain modeling to PostgreSQL database schemas, pessimistic row-locking concurrency, multi-store split ordering, and comprehensive Jest E2E resilience suites.

## 📁 [Frontend Phases (`docs/phases/frontend/`)](./frontend/README.md)
Contains the 6 implementation stages governing the frontend presentation layer, including the 14-section Super Admin Console, the 11-section Store Owner Workspace, the customer shopping experience with shared cart and split checkout, bilingual English/Arabic RTL layout rendering, Vitest unit testing, and Vite production builds.

