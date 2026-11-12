# ADR 004: TypeORM for Data Access

## Status
Accepted

## Context
We need a robust data access layer for NestJS and PostgreSQL. Options included Prisma, TypeORM, and MikroORM. The user explicitly requested TypeORM.

## Decision
We will use **TypeORM** as the Object Relational Mapper (ORM) for the project.

## Consequences
### Positive
- First-class support and deep integration with the NestJS ecosystem (`@nestjs/typeorm`).
- Familiar decorator-based entity definition syntax (`@Entity()`, `@Column()`).
- Supports the complex transaction coordination required for our cross-module checkout workflows via the `QueryRunner`.

### Negative
- TypeORM's Active Record pattern (if misused) can lead to bloated entities; we must strictly enforce the Data Mapper pattern.
- Managing raw SQL for advanced atomic updates (e.g., inventory deduction) is sometimes less elegant than specialized query builders, but achievable.
