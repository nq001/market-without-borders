<div align="center">
  <h1>🛒 Commerce Platform</h1>
  <p><i>A resilient, production-ready E-commerce Order Management Backend</i></p>

  <!-- Badges -->
  <a href="https://nestjs.com"><img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
</div>

<br />

Welcome to — an open-source, enterprise-grade commerce backend. 

Building a simple shopping cart is easy. Building a fault-tolerant system that prevents inventory overselling during traffic spikes, handles payment gateway timeouts gracefully, and maintains strict data consistency across domains? That requires deliberate, careful engineering.

Qubrax is built as a strict **Modular Monolith**. It delivers the velocity of a single codebase while enforcing the architectural boundaries necessary to scale into microservices when the time is right.

---

## ✨ Core Features

* **Concurrency Control:** Utilizes Optimistic Locking at the database layer to guarantee zero inventory overselling, even if multiple users check out simultaneously.
* **Idempotent Checkout:** Event-driven architecture decouples inventory locking from payment processing, ensuring network timeouts never result in lost orders or incorrect charges.
* **Lightning Fast:** Read-heavy catalog queries are accelerated by 12x using Redis caching.
* **Production Parity:** Fully containerized with multi-stage Docker builds, meaning "it works on my machine" translates directly to "it works in production."
* **Role-Based Access Control:** Secure JWT authentication with strict permission boundaries separating Customers and internal Staff/Admins.

## 📚 Deep-Dive Engineering Docs

I strongly believe that code should be accompanied by the context of *why* it was written. Check out the `/docs` directory for full transparency into the engineering process:

* 📖 **[Technical Case Study](docs/reports/06-final/case-study.md)**: A complete retrospective on the hardest challenges solved (concurrency, idempotency).
* 🗄️ **[Database ERD & Schema](docs/phases/05-database.md)**: The strict relational model keeping data consistent.
* 🧪 **[Testing Strategy](docs/reports/05-testing/testing-strategy.md)**: How we rely on the Testing Diamond (Unit -> Integration -> E2E).
* 🚀 **[Production Deployment](docs/reports/04-operations/deployment.md)**: Runbooks and deployment lifecycle scripts.

---

## 🚀 Quick Start (Local Environment)

We use Docker to ensure the local development experience is identical to production. You don't need to install Postgres or Redis locally—Docker handles the heavy lifting.

### 1. Clone & Start
```bash
# Clone the repository
git clone https://github.com/yourusername/qubrax.git
cd qubrax

# Spin up Postgres, Redis, and the NestJS API
# Note: This will automatically run database migrations on startup.
docker-compose up --build -d
```

### 2. Verify Everything is Running
Once the containers are up, check the automated health probes:
👉 **Health Check:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

### 3. Explore the API
Qubrax automatically generates a beautiful Swagger UI for exploring the API contract:
👉 **Swagger Docs:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🧪 Testing

We enforce a strict testing diamond to guarantee reliability before any code hits production.

```bash
# 1. Install dependencies locally
npm ci

# 2. Run fast, isolated Unit Tests (Domain Logic)
npm run test

# 3. Run E2E and Database Integration Tests
# Note: Ensure your local docker-compose environment is running first!
npm run test:e2e
```

## 📝 License

This project is licensed under the MIT License. Built with passion by the Qubrax Engineering Team.
