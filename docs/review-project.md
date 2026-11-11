# Project Codebase Review

This document provides a concise overview of the structure, architectural patterns, and file types within the `src/` directory.

## High-Level Domain Folders (`src/`)
These folders represent the primary bounded contexts of your modular monolith architecture:
*   **`audit/`**: Tracks system-wide events and changes for compliance and security history.
*   **`auth/`**: Handles user authentication (login/register) and JWT token lifecycle.
*   **`cart/`**: Manages shopping cart state, adding items, and running pre-checkout calculations.
*   **`catalog/`**: Manages the product catalog, categories, and read-optimized product data.
*   **`coupons/`**: Handles discount codes, promotional rules, and usage validations.
*   **`health/`**: Exposes health-check endpoints for system monitoring (e.g., for Docker).
*   **`inventory/`**: Manages stock levels and handles concurrency (optimistic locking) to prevent overselling.
*   **`notifications/`**: Dispatches asynchronous alerts (e.g., emails) triggered by events like order completion.
*   **`orders/`**: The core domain managing the complex checkout process, order state, and lifecycle.
*   **`payments/`**: Integrates with payment gateways, handling webhooks safely via idempotency.
*   **`reviews/`**: Manages customer product feedback and ratings.
*   **`shipping/`**: Calculates shipping costs and manages delivery tracking status.
*   **`users/`**: Manages customer profiles, addresses, and staff/admin roles.

## Infrastructure & Shared Folders (`src/`)
*   **`common/`**: Contains cross-cutting concerns shared across the app, such as global exception filters, shared guards, and custom decorators.
*   **`database/`**: Contains database initialization logic.
    *   **`data-source.ts`**: The TypeORM configuration file. It connects the app to PostgreSQL and tells TypeORM where to find entities and migrations.
*   **`redis/`**: Wraps Redis caching configuration, heavily used to speed up read-heavy domains like the catalog.

## Core Root Files (`src/`)
*   **`main.ts`**: The entry point of the NestJS application. It bootstraps the server, applies global validation pipes, and sets up Swagger documentation.
*   **`app.module.ts`**: The root module that imports all domain modules and configures global dependencies (like Database and Config modules).
*   **`app.controller.ts` / `app.service.ts`**: Basic root-level endpoints, typically used for simple status checks.

## NestJS Building Blocks (Found inside domain folders)
*   **`Modules (*.module.ts)`**: 
    The organizational boundary of a domain. It wires together that domain's controllers, services, and database repositories.
*   **`Controllers (*.controller.ts)`**: 
    The HTTP layer. Receives incoming API requests, extracts data, delegates the heavy lifting to services, and returns the HTTP response.
*   **`Services (*.service.ts)`**: 
    The brain of the application. Contains the core business logic, database transactions, and coordinates tasks.
*   **`Entities (*.entity.ts)`**: 
    TypeORM classes that map directly to your PostgreSQL database tables. They define columns, relations (like 1-to-many), and database constraints.
*   **`DTOs (*.dto.ts)`**: 
    Data Transfer Objects. They define the exact shape of data expected in API requests (Payloads). Combined with `class-validator`, they block bad data from entering the controller.
*   **`Guards (*.guard.ts)`**: 
    Security checkpoints. Middleware that determines if a request is allowed to proceed (e.g., checking if a user has a valid JWT, or checking if they are an Admin).
*   **`Decorators (*.decorator.ts)`**: 
    Custom annotations used to clean up code (e.g., an `@CurrentUser()` decorator to easily pull the user object out of the request).

## Database Management
*   **`Migrations`**: 
    Timestamped SQL scripts (managed by TypeORM) that safely update the database schema (adding tables, altering columns) across different environments without losing data.
*   **`Seeds`**: 
    Scripts (usually run during deployment or local setup) used to populate the database with initial foundational data, such as admin accounts, shipping zones, or mock products.
