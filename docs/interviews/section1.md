# Technical Competency Evaluation: Backend Engineering (NestJS, TypeScript, PostgreSQL & Microservices)

This document provides 50 rigorous, production-grounded technical interview questions and comprehensive answers for evaluating Senior and Staff Backend Engineers working with NestJS, TypeScript, PostgreSQL, Node.js, and distributed microservices architectures.

---

## Tier 1: Project Scaffolding & Architecture Design

### Q1: Modular Monolith vs. Microservices Transition in an E-Commerce Platform
- **Context/Scenario:** An e-commerce platform processing 15,000 orders/day is currently implemented as a tightly coupled NestJS monolith. The team is experiencing high deployment collision rates, shared database locking bottlenecks, and wants to immediately split into 8 independent microservices. You are tasked with determining whether to execute an immediate microservices decomposition or adopt a modular monolith architecture first.
- **What to Look For (Evaluation Criteria):**
  - Identifies the operational overhead of microservices (network latency, distributed transactions, observability, CI/CD complexity) and defends a domain-driven Modular Monolith as an evolutionary step.
  - Articulates concrete NestJS architectural boundaries (bounded contexts, domain modules with strictly private providers, export-only interfaces, and shared kernel abstractions).
- **Detailed Answer / Explanation:**
  A senior engineer recognizes that decomposing directly from a coupled monolith to 8 microservices introduces distributed systems fallacies before domain boundaries are stabilized. The recommended strategy is to refactor into a **Modular Monolith** using NestJS feature modules aligned with Domain-Driven Design (DDD) bounded contexts (e.g., `OrderModule`, `InventoryModule`, `PaymentModule`, `CustomerModule`).

  Key architectural tenets:
  1. **Strict Module Encapsulation:** Modules must only export service interfaces/facades, never internal repositories or database entities. Dependency injection between modules must rely on abstract contracts or exported facade services (`OrdersPublicService`).
  2. **Database Schema Segregation:** In PostgreSQL, separate modules by database schemas (`orders.*`, `inventory.*`, `payments.*`) rather than shared public tables. Foreign keys across module boundaries must be converted to logical references (UUIDs) without database-level relational constraints.
  3. **Event-Driven Communication via In-Process Bus:** Use NestJS `@nestjs/event-emitter` for asynchronous domain events (e.g., `OrderCreatedEvent`) to decouple side-effects (e.g., sending emails, analytics) from transactional logic. When the time comes to extract a service, replacing `EventEmitter2` with an external broker (RabbitMQ/Kafka) requires zero changes to core business domain logic.

  ```typescript
  // order.facade.ts - Public contract exported by OrderModule
  @Injectable()
  export class OrderFacade {
    constructor(private readonly orderService: OrderInternalService) {}

    async getOrderSummary(orderId: string): Promise<OrderSummaryDto> {
      return this.orderService.findSummaryById(orderId);
    }
  }

  // order.module.ts
  @Module({
    imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity])],
    providers: [OrderInternalService, OrderFacade],
    exports: [OrderFacade], // OrderInternalService and Repositories are strictly private
  })
  export class OrderModule {}
  ```

---

### Q2: Clean Architecture and Decoupling TypeORM/Prisma from Domain Entities in NestJS
- **Context/Scenario:** A team built a NestJS order management system where TypeORM entity decorators (`@Entity()`, `@Column()`, `@ManyToOne()`) and Active Record / repository calls are mixed directly inside domain business logic and validation classes. A database migration and schema refactoring caused cascading compilation and runtime failures across all business services.
- **What to Look For (Evaluation Criteria):**
  - Demonstrates Hexagonal Architecture (Ports and Adapters) separating pure TypeScript Domain Entities from Persistence Models (TypeORM/Prisma).
  - Explains the role of Repository Interfaces (Inversion of Control) and Entity Mappers with zero external library dependencies in core domain logic.
- **Detailed Answer / Explanation:**
  When database decorators bleed into domain models, the core business rules become tightly coupled to database schema details and ORM lifecycle hooks. In Clean/Hexagonal Architecture:
  1. **Domain Layer:** Pure TypeScript classes containing business invariants and state mutation methods. It has no decorators, no imports from `@nestjs/common`, and no ORM dependencies.
  2. **Ports (Interfaces):** Abstract contracts defining repository operations (`IOrderRepository`).
  3. **Adapters (Persistence Layer):** TypeORM/Prisma entities, repository implementations, and data mappers (`OrderMapper.toDomain()` and `OrderMapper.toPersistence()`).

  ```typescript
  // domain/order.entity.ts (Pure TypeScript)
  export class Order {
    constructor(
      private readonly id: string,
      private customerId: string,
      private items: OrderItem[],
      private status: OrderStatus,
      private totalAmount: number,
    ) {}

    public cancel(reason: string): void {
      if (this.status === OrderStatus.SHIPPED || this.status === OrderStatus.DELIVERED) {
        throw new DomainException('Cannot cancel an order that has already shipped.');
      }
      this.status = OrderStatus.CANCELLED;
    }
    // Getters...
  }

  // domain/ports/order-repository.interface.ts
  export interface IOrderRepository {
    findById(id: string): Promise<Order | null>;
    save(order: Order): Promise<void>;
  }

  export const ORDER_REPOSITORY_TOKEN = Symbol('IOrderRepository');

  // infrastructure/persistence/order.mapper.ts
  export class OrderMapper {
    static toDomain(entity: TypeOrmOrderEntity): Order {
      return new Order(
        entity.id,
        entity.customerId,
        entity.items.map(OrderMapper.toItemDomain),
        entity.status as OrderStatus,
        Number(entity.totalAmount),
      );
    }
    static toPersistence(domain: Order): TypeOrmOrderEntity {
      const entity = new TypeOrmOrderEntity();
      entity.id = domain.getId();
      // map fields...
      return entity;
    }
  }
  ```
  In NestJS, bind the port to the adapter using custom providers: `{ provide: ORDER_REPOSITORY_TOKEN, useClass: TypeOrmOrderRepository }`.

---

### Q3: Dynamic Modules & Multi-Tenant Database Connection Pooling in NestJS
- **Context/Scenario:** An enterprise SaaS platform requires dynamic tenant isolation where each tenant has either their own PostgreSQL database (isolated database model) or their own schema (isolated schema model), determined dynamically at runtime based on the incoming request's subdomain or JWT claims.
- **What to Look For (Evaluation Criteria):**
  - Explains the trade-offs between Request-Scoped providers (`Scope.REQUEST`) vs. Connection Pool Managers / Cache Registries to prevent connection exhaustion.
  - Implements dynamic connection resolution utilizing NestJS dynamic module concepts and middleware/interceptors.
- **Detailed Answer / Explanation:**
  Using `Scope.REQUEST` for database connections causes NestJS to instantiate the entire dependency tree per incoming HTTP request, severely degrading throughput and creating memory pressure. A production-grade design uses a **Singleton Tenant Connection Manager** backed by a LRU cache of `DataSource` or `pg.Pool` instances.

  Execution strategy:
  1. An `AsyncLocalStorage` context or Express middleware extracts the `tenantId` from the JWT or host header and stores it in request execution context.
  2. A `TenantConnectionRegistry` maintains a pool of initialized `DataSource` instances with idle timeouts.
  3. Scoped queries select the connection dynamically or execute an `ALTER ROLE ... SET search_path` / `SET search_path TO tenant_x` inside a dedicated transaction client.

  ```typescript
  @Injectable()
  export class TenantConnectionRegistry {
    private pools = new Map<string, DataSource>();

    async getConnection(tenantId: string): Promise<DataSource> {
      let ds = this.pools.get(tenantId);
      if (!ds || !ds.isInitialized) {
        ds = new DataSource({
          type: 'postgres',
          host: process.env.DB_HOST,
          port: 5432,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: `tenant_${tenantId}`,
          max: 10, // Controlled connection limit per tenant
          idleTimeoutMillis: 30000,
        });
        await ds.initialize();
        this.pools.set(tenantId, ds);
      }
      return ds;
    }
  }
  ```

---

### Q4: Monorepo Workspaces (Nx/Turborepo) vs. Polyrepo for Distributed Contracts
- **Context/Scenario:** A company has 6 backend microservices and 2 frontend web apps written in TypeScript. Team members frequently break downstream consumers when modifying API payload shapes, DTOs, and event schemas because contract types are duplicated across repositories.
- **What to Look For (Evaluation Criteria):**
  - Discusses monorepo tooling (Nx, Turborepo, pnpm workspaces) vs. private npm registry publishing for schema synchronization.
  - Emphasizes single source of truth for DTOs, Zod/Class-Validator schemas, and generated OpenAPI/Protobuf contracts with strict versioning.
- **Detailed Answer / Explanation:**
  The candidate should recommend a **TypeScript Monorepo (Nx or Turborepo with pnpm)** containing:
  - `apps/`: `order-service`, `payment-service`, `inventory-service`, `web-portal`.
  - `packages/contracts/`: Pure TypeScript DTOs, Zod schemas, event payloads, and API interfaces.
  - `packages/common/`: Common interceptors, logging formatters, custom decorators, and error filters.

  Advantages:
  - **Atomic Commits:** Changes to an API contract (e.g., adding an optional field to `CreateOrderDto`) can be updated across the backend producer and frontend/microservice consumers in a single atomic git commit and PR.
  - **Strict Dependency Graph & Computation Caching:** Tools like Nx calculate the affected project graph (`nx affected:test`) to test and build only the impacted services in CI, eliminating unnecessary multi-repository build pipelines.
  - **Shared Contract Validation:** Both backend validation pipes and frontend form validation consume the exact same Zod schema or class-validator rules directly from `@acme/contracts`.

---

### Q5: Domain-Driven Design (DDD) Aggregates and Invariant Enforcement in Order Entities
- **Context/Scenario:** In a shopping cart and checkout service, developers are directly inserting and updating `order_items` via `OrderItemRepository.save()`. As a result, orders frequently end up with negative total prices, missing currency codes, or orders marked as "PAID" without any items attached.
- **What to Look For (Evaluation Criteria):**
  - Explains the DDD Aggregate Root concept: entities outside the aggregate cannot directly modify internal child entities; all modifications must go through the Root.
  - Demonstrates encapsulation of business invariants (validation, tax calculation, state checks) directly within the Aggregate Root class methods.
- **Detailed Answer / Explanation:**
  In DDD, the `Order` is an **Aggregate Root**. An aggregate root defines a consistency boundary. External code should NEVER directly persist or mutate `OrderItem` instances through an `OrderItemRepository`. All mutations must pass through the `Order` aggregate methods to ensure system invariants are permanently preserved.

  ```typescript
  export class OrderAggregate {
    private readonly items: Map<string, OrderLineItem> = new Map();
    private status: OrderStatus = OrderStatus.DRAFT;
    private totalAmount: number = 0;

    public addItem(productId: string, unitPrice: number, quantity: number): void {
      if (this.status !== OrderStatus.DRAFT) {
        throw new DomainRuleException('Cannot modify items of a finalized order.');
      }
      if (unitPrice <= 0 || quantity <= 0) {
        throw new DomainRuleException('Price and quantity must be positive integers.');
      }

      if (this.items.has(productId)) {
        const existing = this.items.get(productId)!;
        existing.increaseQuantity(quantity);
      } else {
        this.items.set(productId, new OrderLineItem(productId, unitPrice, quantity));
      }

      this.recalculateTotal();
    }

    private recalculateTotal(): void {
      let sum = 0;
      for (const item of this.items.values()) {
        sum += item.getLineTotal();
      }
      this.totalAmount = sum;
    }

    public checkout(): void {
      if (this.items.size === 0) {
        throw new DomainRuleException('Cannot checkout an empty order.');
      }
      this.status = OrderStatus.PENDING_PAYMENT;
    }
  }
  ```
  The persistence layer must only have an `OrderRepository` that serializes and deserializes the entire aggregate boundary in one atomic transaction.

---

### Q6: Event-Driven Broker Selection: RabbitMQ vs. Apache Kafka vs. Redis Streams
- **Context/Scenario:** An order processing system needs to broadcast events (`OrderCreated`, `PaymentReceived`, `OrderFulfilled`) to several downstream microservices (Notifications, Inventory, Analytics, Third-party Logistics). The team needs to pick a message broker and justify the selection based on throughput, event replay, and ordering guarantees.
- **What to Look For (Evaluation Criteria):**
  - Compares queuing semantics (RabbitMQ AMQP: smart broker, dumb consumer, push-based, message ack/nack) vs. distributed append-only log semantics (Kafka: partitions, consumer offsets, replayability, high throughput) vs. lightweight in-memory streams (Redis Streams).
  - Matches the use case: RabbitMQ for complex routing and work-queue distribution vs. Kafka for event sourcing, historical replay, and high data scale.
- **Detailed Answer / Explanation:**
  - **RabbitMQ (AMQP):** Best for task distribution and transactional workflow coordination. Features fine-grained routing (direct, topic, fanout exchanges) and per-message acknowledgment. When a message is acknowledged, it is deleted from the queue. Ideal for discrete e-commerce order fulfillment steps where individual tasks must be retried or routed to dead-letter exchanges (DLX) with priority queues.
  - **Apache Kafka:** Distributed commit log. Messages are written to append-only partitions and retained based on time/size retention policies, allowing consumers to replay historical events from any arbitrary offset. Crucial for audit trails, event sourcing, data warehousing, and when hundreds of microservices need to independently consume the stream at their own pace without impacting broker memory.
  - **Redis Streams:** Lightweight, in-memory log with consumer groups and persistence (AOF/RDB). Excellent for mid-scale systems (<50,000 msg/sec) where Redis is already part of the infrastructure stack and maintaining a Kafka/Zookeeper/KRaft cluster incurs excessive operational complexity.

  **Verdict for Order Management:** Use **Kafka** if historical event replay, analytics streaming, and event sourcing are mandatory. Use **RabbitMQ** if the primary need is resilient asynchronous task queues with complex routing, DLQ reprocessing, and immediate consumer dispatch.

---

### Q7: Configuration Management, Secret Rotation, and Dynamic Validation in NestJS
- **Context/Scenario:** A NestJS backend was deployed to production and crashed at runtime after handling requests because an environment variable `DATABASE_URL` was misspelled, and `PAYMENT_GATEWAY_API_KEY` was missing. The system also needs to support rotation of database credentials without requiring a container restart.
- **What to Look For (Evaluation Criteria):**
  - Implements startup schema validation using `@nestjs/config` with Joi or Zod schemas to fail fast on boot (`validateOnBoot`).
  - Addresses secret rotation mechanisms (AWS Secrets Manager / HashiCorp Vault dynamic polling, dynamic connection refreshing).
- **Detailed Answer / Explanation:**
  To guarantee that a service never starts in an invalid state, configuration must be strictly validated at boot time before any modules are initialized:

  ```typescript
  import { z } from 'zod';

  export const environmentSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    REDIS_HOST: z.string().min(1),
    PAYMENT_GATEWAY_KEY: z.string().min(32),
  });

  export type Environment = z.infer<typeof environmentSchema>;

  // app.module.ts
  @Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        validate: (config: Record<string, unknown>) => {
          const result = environmentSchema.safeParse(config);
          if (!result.success) {
            throw new Error(`Config validation error: ${result.error.toString()}`);
          }
          return result.data;
        },
      }),
    ],
  })
  export class AppModule {}
  ```
  For secret rotation without restarts:
  Use a background task or AWS Secrets Manager SDK client that refreshes cached credentials every $N$ hours. The database module must expose a dynamic credential provider that feeds fresh credentials into the `pg` pool when reconnection attempts occur.

---

### Q8: API Versioning Strategies and Deprecation Lifecycle in NestJS Microservices
- **Context/Scenario:** You manage an Order API consumed by third-party partner integrations, legacy iOS/Android apps, and an in-house React SPA. You must introduce breaking changes to the checkout DTO without breaking mobile clients that may not update for months.
- **What to Look For (Evaluation Criteria):**
  - Explains the trade-offs of URI path versioning (`/v1/orders`), Custom Header versioning (`X-API-Version: 2`), and Media Type/Content Negotiation versioning.
  - Implements NestJS `VersioningType.URI` or `VersioningType.HEADER`, controller/route-level versioning, and deprecation headers (`Sunset`, `Deprecation`, RFC 8594).
- **Detailed Answer / Explanation:**
  **URI Versioning** (`/api/v1/orders` vs `/api/v2/orders`) is the most transparent and cache-friendly strategy for public APIs and mobile clients, whereas **Header Versioning** (`Accept-Version: 2.0.0`) provides cleaner URLs.

  NestJS Native Implementation:
  ```typescript
  // main.ts
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // order.controller.ts
  @Controller('orders')
  export class OrderController {
    @Version('1')
    @Get(':id')
    getOrderV1(@Param('id') id: string) {
      return this.orderService.findV1(id);
    }

    @Version('2')
    @Get(':id')
    @Header('Sunset', 'Wed, 11 Nov 2026 00:00:00 GMT')
    @Header('Deprecation', '@1762819200')
    getOrderV2(@Param('id') id: string) {
      return this.orderService.findV2(id);
    }
  }
  ```
  Deprecation lifecycle:
  1. Announce version $N+1$ and set RFC 8594 `Deprecation` and `Sunset` HTTP response headers on version $N$.
  2. Emit metric logs when deprecated versions are invoked to trace which API clients still use them.
  3. Establish an SLA window (e.g., 6 months) before returning `410 Gone`.

---

### Q9: Synchronous vs. Asynchronous Communication Patterns in Order Processing
- **Context/Scenario:** When a user clicks "Place Order", the checkout service needs to: (1) verify inventory, (2) authorize credit card, (3) create order record, (4) generate tracking number with DHL, (5) send confirmation email, and (6) update marketing analytics. The current REST endpoint takes 6.5 seconds to return.
- **What to Look For (Evaluation Criteria):**
  - Differentiates between critical-path synchronous operations (inventory hold, payment auth, order persistence) and non-critical asynchronous side-effects (shipping label generation, notifications, analytics).
  - Proposes gRPC for low-latency synchronous inter-service calls and an asynchronous event bus/queue for side-effects, dropping HTTP response time to <300ms.
- **Detailed Answer / Explanation:**
  The 6.5-second latency is caused by treating non-critical external third-party requests and downstream side-effects synchronously inside the client-facing HTTP request cycle.

  Architectural decomposition:
  1. **Synchronous Critical Path (<300ms):**
     - Inventory Reservation (via fast internal gRPC call or in-database transactional lock).
     - Payment Authorization (synchronous call to payment gateway; if auth fails, the order cannot be placed).
     - Persist Order in state `PAYMENT_AUTHORIZED`.
     - Return HTTP `201 Created` with `{ orderId, status: "ACCEPTED" }` to client immediately.
  2. **Asynchronous Background Processing (via Event Broker / Queues):**
     - Emit `OrderPlacedEvent` into Kafka/RabbitMQ.
     - **Notification Worker:** Consumes event, sends email/SMS. If email fails, retries independently without impacting the order.
     - **Fulfillment Service:** Consumes event, calls DHL API to generate tracking code, transitions order to `PROCESSING`.
     - **Analytics Service:** Aggregates order metrics into ClickHouse/BigQuery.

---

### Q10: Custom NestJS Decorators and Metadata Reflection for Declarative RBAC and Feature Flags
- **Context/Scenario:** Your order management backend requires that certain order cancellation actions be restricted to users with the `CUSTOMER_SUPPORT_LEAD` role, while others require an active feature flag `ENABLE_INSTANT_REFUNDS`. The codebase is polluted with repetitive `if (user.roles.includes(...))` and `if (await featureService.isEnabled(...))` checks in every service method.
- **What to Look For (Evaluation Criteria):**
  - Creates custom parameter/method decorators using `SetMetadata` and `Reflector` in NestJS.
  - Implements global or controller-level `CanActivate` Guards that inspect runtime metadata and enforce rules declaratively.
- **Detailed Answer / Explanation:**
  Refactoring imperative authorization checks into declarative NestJS Guards keeps business logic clean and DRY.

  ```typescript
  // decorators/auth-policy.decorator.ts
  export const ROLES_KEY = 'roles';
  export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

  export const FEATURE_FLAG_KEY = 'feature_flag';
  export const RequireFeature = (flag: string) => SetMetadata(FEATURE_FLAG_KEY, flag);

  // guards/auth-policy.guard.ts
  @Injectable()
  export class AuthPolicyGuard implements CanActivate {
    constructor(
      private readonly reflector: Reflector,
      private readonly featureService: FeatureFlagService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      const flag = this.reflector.get<string>(FEATURE_FLAG_KEY, context.getHandler());

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (roles && !roles.some((r) => user?.roles?.includes(r))) {
        throw new ForbiddenException('Insufficient role permissions');
      }

      if (flag && !(await this.featureService.isEnabled(flag, user?.tenantId))) {
        throw new ForbiddenException(`Feature ${flag} is disabled`);
      }

      return true;
    }
  }

  // usage in controller
  @Post(':id/instant-refund')
  @Roles('CUSTOMER_SUPPORT_LEAD', 'ADMIN')
  @RequireFeature('ENABLE_INSTANT_REFUNDS')
  async triggerInstantRefund(@Param('id') id: string) {
    return this.orderService.processRefund(id);
  }
  ```

---

## Tier 2: State Management, Data Flow & API Integration

### Q11: Managing Distributed Transactions with the Saga Pattern in Order Fulfillment
- **Context/Scenario:** An order checkout involves three distributed microservices: `OrderService`, `PaymentService`, and `InventoryService`. A customer places an order, the credit card is charged, but the inventory reservation fails because stock was depleted concurrently. The system is left in an inconsistent state where money was deducted but no goods can be shipped.
- **What to Look For (Evaluation Criteria):**
  - Contrasts Orchestrated Sagas (central coordinator, command/reply channels) with Choreographed Sagas (decentralized event listening) and details compensating transactions.
  - Explains how to handle failure recovery, idempotency in compensating transactions (e.g., refund payment), and intermediate states (`PENDING_INVENTORY`, `REFUNDED`).
- **Detailed Answer / Explanation:**
  In distributed microservices, 2-Phase Commit (2PC) does not scale and creates synchronous blocking locks. The **Saga Pattern** breaks the distributed transaction into a series of local transactions with corresponding compensating actions.

  **Orchestrator vs. Choreography:**
  - **Choreography:** Services react to domain events. Simpler for small workflows (2-3 services), but creates circular dependencies and tangled mental models at scale.
  - **Orchestration (Recommended for Complex Orders):** An `OrderSagaOrchestrator` maintains a state machine and dispatches commands to services, listening for success/failure replies.

  ```
  [Start Checkout] -> (1) Reserve Inventory -> [Success]
                   -> (2) Process Payment   -> [Failed: Card Declined]
                   -> [Trigger Compensation] -> (3) Cancel Inventory Reservation -> [Order FAILED]
  ```

  Implementation pattern in NestJS:
  ```typescript
  @Injectable()
  export class OrderFulfillmentSagaOrchestrator {
    constructor(
      private readonly paymentClient: PaymentServiceClient,
      private readonly inventoryClient: InventoryServiceClient,
      private readonly orderRepo: OrderRepository,
    ) {}

    async executeOrderSaga(orderId: string, payload: CheckoutPayload): Promise<void> {
      // Step 1: Local State -> PENDING
      await this.orderRepo.updateStatus(orderId, OrderStatus.PENDING);

      // Step 2: Reserve Inventory
      const reservation = await this.inventoryClient.reserveStock({ orderId, items: payload.items });
      if (!reservation.success) {
        await this.orderRepo.updateStatus(orderId, OrderStatus.FAILED_OUT_OF_STOCK);
        return;
      }

      // Step 3: Charge Payment
      try {
        const paymentResult = await this.paymentClient.charge({
          orderId,
          amount: payload.amount,
          token: payload.paymentToken,
        });

        if (paymentResult.status === 'SUCCESS') {
          await this.orderRepo.updateStatus(orderId, OrderStatus.PAID);
        } else {
          throw new Error('Payment rejected');
        }
      } catch (err) {
        // Compensating Transaction: Release Inventory
        await this.inventoryClient.releaseStock({ reservationId: reservation.id });
        await this.orderRepo.updateStatus(orderId, OrderStatus.FAILED_PAYMENT);
      }
    }
  }
  ```
  Every compensating action must be strictly idempotent to allow safe automatic retries in the event of transient network drops.

---

### Q12: Transactional Outbox Pattern with PostgreSQL to Prevent Dual-Write Failures
- **Context/Scenario:** In an `OrderService`, the code saves an order into PostgreSQL via TypeORM and immediately calls `kafkaProducer.send({ topic: 'order-created', ... })`. During a traffic spike, the database commit succeeded, but the network request to Kafka timed out. The order was created in PostgreSQL, but the downstream inventory and notification services never received the event.
- **What to Look For (Evaluation Criteria):**
  - Identifies the "Dual-Write Problem" where persisting to a database and publishing to a message broker cannot be wrapped in a single ACID transaction without distributed commit locks.
  - Implements the Transactional Outbox Pattern: persisting the domain entity and the outbox event within the exact same PostgreSQL database transaction, processed by an asynchronous CDC engine (Debezium) or polling worker.
- **Detailed Answer / Explanation:**
  Writing to a database and a broker sequentially creates an unavoidable failure window: if the app crashes or the network blips between the DB commit and broker publish, data becomes permanently desynchronized.

  **The Solution: Transactional Outbox Pattern:**
  1. Create an `outbox` table in PostgreSQL.
  2. Inside a single PostgreSQL transaction (`BEGIN ... COMMIT`), insert the `orders` record AND insert an `outbox` record.
  3. A reliable process reads the `outbox` table and publishes the messages to Kafka/RabbitMQ.

  ```sql
  CREATE TABLE outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
  );
  ```

  NestJS Transactional write:
  ```typescript
  await this.dataSource.transaction(async (manager) => {
    const order = manager.create(OrderEntity, orderData);
    await manager.save(order);

    const outboxMessage = manager.create(OutboxEntity, {
      aggregateType: 'Order',
      aggregateId: order.id,
      eventType: 'OrderCreated',
      payload: { id: order.id, customerId: order.customerId, total: order.totalAmount },
    });
    await manager.save(outboxMessage);
  });
  ```

  **Relaying Outbox Events:**
  - **Option A (Log-based CDC - Recommended for high scale):** Debezium captures PostgreSQL Write-Ahead Logs (WAL) via logical decoding and streams changes directly into Kafka with zero DB polling overhead.
  - **Option B (Polling Worker with `FOR UPDATE SKIP LOCKED`):** A background worker queries unprocessed records:
    `SELECT * FROM outbox WHERE processed_at IS NULL ORDER BY created_at LIMIT 100 FOR UPDATE SKIP LOCKED;`

---

### Q13: State Machine Implementation for Complex Order Status Transitions
- **Context/Scenario:** An order passes through multiple states: `DRAFT -> PENDING_PAYMENT -> AUTHORIZED -> PROCESSING -> SHIPPED -> DELIVERED`, with potential branchings into `CANCELLED`, `RETURN_REQUESTED`, or `REFUNDED`. Customer service representatives are able to accidentally mark an already `DELIVERED` order as `PENDING_PAYMENT`, corrupting reporting and billing.
- **What to Look For (Evaluation Criteria):**
  - Explains the Finite State Machine (FSM) pattern to enforce explicit, valid state transitions and guard conditions.
  - Details implementation using pure TypeScript classes, libraries (e.g., XState, `javascript-state-machine`), or custom transition tables stored in the database.
- **Detailed Answer / Explanation:**
  Without a formal state machine, status updates rely on scattered `if/else` checks, leading to invalid state jumps.

  A robust state machine defines:
  1. Valid states (`OrderStatus`).
  2. Allowed transitions (`ALLOWED_TRANSITIONS` map).
  3. Pre-transition guard rules and post-transition actions.

  ```typescript
  export enum OrderStatus {
    DRAFT = 'DRAFT',
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    PAID = 'PAID',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
  }

  export class OrderStateMachine {
    private static readonly TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
      [OrderStatus.DRAFT]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    public static canTransition(current: OrderStatus, target: OrderStatus): boolean {
      const allowed = this.TRANSITIONS[current];
      return allowed ? allowed.includes(target) : false;
    }

    public static transition(order: OrderEntity, target: OrderStatus, reason?: string): void {
      if (!this.canTransition(order.status, target)) {
        throw new BadRequestException(
          `Invalid state transition: Cannot change order from ${order.status} to ${target}.`
        );
      }
      order.status = target;
      // Record audit history log
    }
  }
  ```

---

### Q14: Handling Idempotency in Payment & Checkout APIs via Idempotency-Key Headers
- **Context/Scenario:** On a slow mobile cellular connection, a user clicks "Pay $250". Because the HTTP request hung for 4 seconds, the user aggressively tapped the button three more times. The backend created three distinct charges against the customer's credit card.
- **What to Look For (Evaluation Criteria):**
  - Discusses HTTP `Idempotency-Key` headers (RFC draft standard) and distributed Redis lock / caching mechanisms.
  - Implements an atomic lock check, caching the final response payload to return identical responses to duplicate requests without re-executing side-effects.
- **Detailed Answer / Explanation:**
  Payment and checkout mutations must be strictly idempotent. A production solution uses an `IdempotencyInterceptor` backed by Redis:

  1. Client sends an `Idempotency-Key: <UUID>` header with the mutation request.
  2. The interceptor attempts to acquire a distributed lock in Redis:
     `SET idempotency:<key> "PROCESSING" NX PX 30000`
  3. If the key already exists with status `"PROCESSING"`: Return HTTP `409 Conflict` or wait/poll if within retry window.
  4. If the key already exists with status `"COMPLETED"`: Return the cached response body and status code immediately without invoking the handler.
  5. If the lock was acquired: Execute the request handler, write the final response payload into Redis with a 24-hour TTL, and set status to `"COMPLETED"`.

  ```typescript
  @Injectable()
  export class IdempotencyInterceptor implements NestInterceptor {
    constructor(private readonly redis: RedisClient) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const req = context.switchToHttp().getRequest();
      const idempotencyKey = req.headers['idempotency-key'];

      if (!idempotencyKey) return next.handle();

      const cacheKey = `idempotency:${req.user?.id || 'anon'}:${idempotencyKey}`;
      const existing = await this.redis.get(cacheKey);

      if (existing) {
        const cached = JSON.parse(existing);
        if (cached.status === 'PROCESSING') {
          throw new ConflictException('Concurrent request in progress for this idempotency key.');
        }
        return of(cached.response);
      }

      // Acquire lock
      const acquired = await this.redis.set(cacheKey, JSON.stringify({ status: 'PROCESSING' }), 'PX', 20000, 'NX');
      if (!acquired) {
        throw new ConflictException('Concurrent request detected.');
      }

      return next.handle().pipe(
        tap(async (response) => {
          await this.redis.set(
            cacheKey,
            JSON.stringify({ status: 'COMPLETED', response }),
            'EX',
            86400, // 24 hours
          );
        }),
      );
    }
  }
  ```

---

### Q15: Optimistic vs. Pessimistic Locking in PostgreSQL for High-Contention Flash Sales
- **Context/Scenario:** A limited edition sneaker drop has 500 units in stock. At 10:00 AM, 50,000 concurrent checkout requests hit the `InventoryService` within 10 seconds. In testing, the database showed negative inventory balances (-1,240 units) and massive connection pool timeouts.
- **What to Look For (Evaluation Criteria):**
  - Contrasts Optimistic Locking (`version` column) with Pessimistic Locking (`SELECT ... FOR UPDATE`).
  - Identifies that under extreme contention, Optimistic Locking causes high abort/retry storms; demonstrates single-query atomic decrements with SQL constraints or Redis pre-allocation tokens.
- **Detailed Answer / Explanation:**
  - **Optimistic Locking:** Checks a `version` column before updating (`UPDATE stock SET quantity = quantity - 1, version = version + 1 WHERE id = 1 AND version = 5`). Under high contention (50,000 requests for 500 items), 99% of transactions fail verification, triggering massive retry loops that peg CPU and pool capacity.
  - **Pessimistic Locking:** `SELECT * FROM inventory WHERE product_id = $1 FOR UPDATE`. Serializes transactions at the database row level. This prevents race conditions but holds database locks for the duration of the transaction, leading to connection starvation and connection timeouts.

  **Production Best Practice for Flash Sales:**
  1. **Atomic In-Database Decrement with Constraint Guard:**
     ```sql
     UPDATE inventory
     SET available_quantity = available_quantity - $1
     WHERE product_id = $2 AND available_quantity >= $1
     RETURNING available_quantity;
     ```
     This executes in a single round-trip without long-held transaction locks. If the row count returned is 0, stock is exhausted.
  2. **Redis In-Memory Pre-Allocation (High Scale):**
     Use a Redis Lua script to decrement available stock in sub-milliseconds:
     ```lua
     local stock = redis.call('get', KEYS[1])
     if stock and tonumber(stock) >= tonumber(ARGV[1]) then
         return redis.call('decrby', KEYS[1], ARGV[1])
     else
         return -1
     end
     ```
     Only the 500 successful requests proceed to PostgreSQL to persist orders asynchronously.

---

### Q16: Resilience and Fault Tolerance: Circuit Breakers and Fallbacks for External Payment Gateways
- **Context/Scenario:** Your checkout service relies on Stripe and PayPal APIs. During an upstream outage, Stripe's API began hanging for 45 seconds per request before timing out. This caused Node.js HTTP worker threads and connection sockets to exhaust, crashing your entire backend and bringing down unrelated endpoints like product browsing.
- **What to Look For (Evaluation Criteria):**
  - Demonstrates the Circuit Breaker pattern (Closed, Open, Half-Open states) using tools like Opossum or Cockatiel.
  - Configures strict client timeouts, exponential backoff with jitter, and graceful customer fallback mechanisms.
- **Detailed Answer / Explanation:**
  When an external dependency fails slowly, requests pile up, exhausting sockets, memory, and database connections (cascade failure).

  Circuit Breaker Mechanics:
  - **CLOSED:** Normal state. Calls pass through. Failure counts are tracked.
  - **OPEN:** If failure percentage exceeds threshold (e.g., 50% over 10 seconds), the circuit trips OPEN. All calls immediately fail fast with a local `ServiceUnavailableException` or route to a secondary fallback provider without touching the network.
  - **HALF-OPEN:** After a cool-down window (e.g., 30s), a trial request is permitted. If successful, the circuit resets to CLOSED; if it fails, it trips back to OPEN.

  ```typescript
  import CircuitBreaker from 'opossum';

  @Injectable()
  export class PaymentGatewayService {
    private breaker: CircuitBreaker;

    constructor(private readonly stripeClient: StripeClient) {
      const options = {
        timeout: 4000, // Timeout after 4s (avoid 45s hang)
        errorThresholdPercentage: 50, // Trip if 50% fail
        resetTimeout: 30000, // Retry after 30s
      };

      this.breaker = new CircuitBreaker(
        (params: ChargeParams) => this.stripeClient.charges.create(params),
        options,
      );

      this.breaker.fallback(() => {
        throw new ServiceUnavailableException('Primary payment gateway offline. Route to backup gateway.');
      });
    }

    async charge(params: ChargeParams) {
      return this.breaker.fire(params);
    }
  }
  ```

---

### Q17: GraphQL Federation vs. REST BFF (Backend-for-Frontend) for Multi-Channel E-Commerce
- **Context/Scenario:** An e-commerce platform serves three client surfaces: a desktop Web SPA with rich merchandising details, a mobile iOS/Android app running on bandwidth-constrained cellular networks, and an in-store POS terminal. You must design an API aggregation layer that prevents over-fetching and under-fetching.
- **What to Look For (Evaluation Criteria):**
  - Compares Apollo Federation / GraphQL Subgraphs with REST-based Backend-for-Frontend (BFF) patterns.
  - Discusses caching, operational overhead, payload optimization, and team development velocity.
- **Detailed Answer / Explanation:**
  - **REST BFF (Backend-for-Frontend):**
    Each client platform gets a dedicated lightweight NestJS Gateway service (`web-bff`, `mobile-bff`, `pos-bff`).
    - *Pros:* Complete control over response serialization, simple HTTP edge caching with standard CDNs (Cloudflare/Fastly), and independent release cycles tailored to platform teams.
    - *Cons:* Duplicated aggregation logic if multiple BFFs perform similar multi-service joins.
  - **GraphQL Federation (Apollo Federation):**
    Underlying microservices expose subgraphs (`@key(fields: "id")`), and an Apollo Gateway / Router composes them into a unified supergraph.
    - *Pros:* Mobile clients specify the exact fields needed (eliminating over-fetching), while web clients query deep relational trees in a single round-trip.
    - *Cons:* Complex caching (POST requests cannot be cached by default HTTP reverse proxies without persisted queries), query complexity attacks requiring cost-analysis guards, and higher learning curve.

  **Recommendation:**
  For teams with a high mobile client base and multi-entity relationship graphs, **GraphQL Federation** with Apollo Router and Persisted Queries provides optimal flexibility. If the engineering organization lacks GraphQL maturity, **REST BFFs** minimize operational complexity.

---

### Q18: CQRS (Command Query Responsibility Segregation) Architecture in NestJS
- **Context/Scenario:** In an enterprise procurement platform, order queries require joining 12 tables (orders, order items, taxes, shipping addresses, invoice history, vendor metadata, discounts). As write volume increased, complex read queries caused lock contention on the primary database, severely slowing down transactional checkout commands.
- **What to Look For (Evaluation Criteria):**
  - Explains the architectural separation of write models (Commands) from read models (Queries) using `@nestjs/cqrs`.
  - Details database read-replica routing or asynchronous denormalized projections (e.g., Elasticsearch or read-optimized PostgreSQL tables).
- **Detailed Answer / Explanation:**
  CQRS separates mutation actions (Commands: create, cancel, update) from data retrieval (Queries: list orders, search, analytics).

  Structure in NestJS:
  1. **Command Side:**
     - Executes business rules and enforces invariants on normalized transactional tables (e.g., PostgreSQL primary).
     - Emits domain events upon commit (`OrderCreatedEvent`).
  2. **Query Side:**
     - Subscribes to events or reads from an asynchronous denormalized read-model (e.g., read-optimized flat tables or Elasticsearch).
     - Bypasses ORM domain aggregates to execute high-speed, direct projection queries.

  ```typescript
  // command/create-order.command.ts
  export class CreateOrderCommand {
    constructor(public readonly customerId: string, public readonly items: ItemDto[]) {}
  }

  // command/create-order.handler.ts
  @CommandHandler(CreateOrderCommand)
  export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
    constructor(
      private readonly repository: OrderAggregateRepository,
      private readonly eventPublisher: EventPublisher,
    ) {}

    async execute(command: CreateOrderCommand): Promise<string> {
      const order = OrderAggregate.create(command.customerId, command.items);
      await this.repository.save(order);
      this.eventPublisher.mergeObjectContext(order).commit(); // emits OrderCreatedEvent
      return order.id;
    }
  }

  // query/get-order-details.handler.ts
  @QueryHandler(GetOrderDetailsQuery)
  export class GetOrderDetailsHandler implements IQueryHandler<GetOrderDetailsQuery> {
    constructor(@InjectDataSource('read_replica') private readonly db: DataSource) {}

    async execute(query: GetOrderDetailsQuery) {
      // Direct raw SQL projection without ORM overhead
      return this.db.query('SELECT * FROM order_read_model WHERE id = $1', [query.orderId]);
    }
  }
  ```

---

### Q19: Webhooks Engine Architecture: Secure Delivery, HMAC Signatures, and DLQ
- **Context/Scenario:** You are building an outbound webhook system that notifies third-party merchant servers whenever an order status changes. Several merchant endpoints are intermittently slow, timeout, or experience down periods, causing your dispatch workers to hang and run out of memory.
- **What to Look For (Evaluation Criteria):**
  - Details message signing using HMAC-SHA256 with timestamp headers to prevent replay attacks.
  - Implements an asynchronous worker queue (BullMQ/Redis or SQS) with exponential backoff, jitter, and a Dead-Letter Queue (DLQ) policy.
- **Detailed Answer / Explanation:**
  A resilient outbound webhooks engine requires three pillars: cryptographic security, isolated delivery workers, and exponential backoff retry policies.

  **1. Security (HMAC-SHA256 Signature):**
  Include `X-Webhook-Signature` and `X-Webhook-Timestamp` headers. Compute:
  `signature = HMAC-SHA256(secret, timestamp + "." + jsonPayload)`. The receiver verifies this signature to prevent tampering and checks `abs(now - timestamp) < 300` to prevent replay attacks.

  **2. Asynchronous Queue Architecture (NestJS + BullMQ):**
  ```typescript
  @Processor('webhooks')
  export class WebhookConsumer extends WorkerHost {
    constructor(private readonly httpService: HttpService) {
      super();
    }

    async process(job: Job<WebhookJobData>): Promise<void> {
      const { url, payload, secret, attempt } = job.data;
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${JSON.stringify(payload)}`)
        .digest('hex');

      try {
        await axios.post(url, payload, {
          headers: {
            'X-Webhook-Signature': signature,
            'X-Webhook-Timestamp': timestamp,
            'Content-Type': 'application/json',
          },
          timeout: 5000, // Strict 5s timeout
        });
      } catch (error) {
        // BullMQ will automatically retry based on exponential backoff config
        throw error;
      }
    }
  }
  ```

  **3. Retry & Dead-Letter Queue (DLQ):**
  Configure BullMQ job options:
  `attempts: 8, backoff: { type: 'exponential', delay: 2000 }`. If all 8 attempts fail over 24 hours, move the job to a `webhooks-dlq` and alert the merchant via their developer dashboard.

---

### Q20: Bulk Data Ingestion and Streaming File Processing (CSV/JSON Catalog Feeds)
- **Context/Scenario:** Every midnight, enterprise merchants upload CSV files containing up to 2,000,000 product catalog updates (500MB+ file sizes). An existing implementation reads the entire file into a Node.js `Buffer`, parses it with `JSON.parse()`, and executes `Repository.save()` in a `for` loop, immediately crashing the container with `JavaScript heap out of memory`.
- **What to Look For (Evaluation Criteria):**
  - Utilizes Node.js Streams (`fs.createReadStream`, `csv-parser`, `stream.pipeline`) with backpressure control to maintain a flat memory footprint (<100MB).
  - Employs PostgreSQL `COPY ... FROM STDIN` or batched bulk inserts with `unnest()` / temporary staging tables.
- **Detailed Answer / Explanation:**
  Loading multi-gigabyte files into Node.js memory causes heap exhaustion. A streaming pipeline processes data line-by-line while maintaining backpressure.

  ```typescript
  import { pipeline } from 'node:stream/promises';
  import fs from 'node:fs';
  import csv from 'csv-parser';
  import { from as copyFrom } from 'pg-copy-streams';

  @Injectable()
  export class CatalogIngestionService {
    constructor(@Inject('PG_POOL') private readonly pool: pg.Pool) {}

    async ingestCatalogCsv(filePath: string): Promise<void> {
      const client = await this.pool.connect();
      try {
        await client.query('CREATE TEMP TABLE staging_products (LIKE products INCLUDING ALL)');

        // Stream directly to PostgreSQL STDIN via COPY
        const copyStream = client.query(
          copyFrom("COPY staging_products (sku, title, price, stock) FROM STDIN WITH (FORMAT csv, HEADER true)")
        );

        const fileStream = fs.createReadStream(filePath);

        // Streams pipeline automatically handles backpressure and error cleanup
        await pipeline(fileStream, copyStream);

        // Atomic Upsert from staging table into target table
        await client.query(`
          INSERT INTO products (sku, title, price, stock)
          SELECT sku, title, price, stock FROM staging_products
          ON CONFLICT (sku) DO UPDATE
          SET title = EXCLUDED.title,
              price = EXCLUDED.price,
              stock = EXCLUDED.stock,
              updated_at = NOW();
        `);
      } finally {
        client.release();
      }
    }
  }
  ```
  This architecture ingests 2,000,000 records in under 30 seconds with constant memory usage under 60MB.

---

## Tier 3: Performance Tuning, Security & Scalability

### Q21: Mitigating the N+1 Query Problem in TypeORM/Prisma with DataLoader
- **Context/Scenario:** An endpoint returning a list of 50 orders with their respective line items and customer profiles is executing 101 separate SQL queries against PostgreSQL. During peak traffic, database CPU reaches 100%, and API response times degrade from 40ms to 4,800ms.
- **What to Look For (Evaluation Criteria):**
  - Explains the mechanics of the N+1 query problem in relational ORMs and why lazy loading or unoptimized `.find()` loops trigger cascading queries.
  - Implements batched eager loading via QueryBuilder `leftJoinAndSelect` or the `DataLoader` pattern (batching and caching IDs into a single `WHERE id IN (...)` query).
- **Detailed Answer / Explanation:**
  The N+1 problem occurs when an application executes 1 initial query to fetch $N$ parent records, and subsequently issues $N$ separate queries to fetch related child entities.

  **Solutions:**
  1. **QueryBuilder with Explicit Joins (Relational Query):**
     ```typescript
     const orders = await this.orderRepository
       .createQueryBuilder('order')
       .leftJoinAndSelect('order.items', 'item')
       .leftJoinAndSelect('order.customer', 'customer')
       .where('order.tenantId = :tenantId', { tenantId })
       .orderBy('order.createdAt', 'DESC')
       .take(50)
       .getMany();
     ```
     This executes a single optimized SQL join. However, when joining multiple one-to-many collections, Cartesian product ballooning can occur.
  2. **DataLoader (Batching & In-Memory Deduplication):**
     Popularized by GraphQL but equally vital for REST and microservices, `DataLoader` batches individual ID lookups collected across a single Node.js event-loop tick into a single batched array query.

     ```typescript
     @Injectable()
     export class CustomerBatchLoader {
       private loader: DataLoader<string, CustomerDto>;

       constructor(private readonly customerRepo: CustomerRepository) {
         this.loader = new DataLoader<string, CustomerDto>(async (customerIds) => {
           const customers = await this.customerRepo.findByIds(customerIds as string[]);
           const map = new Map(customers.map((c) => [c.id, c]));
           // Ensure items are returned in the exact order of keys
           return customerIds.map((id) => map.get(id) || null);
         });
       }

       load(customerId: string): Promise<CustomerDto> {
         return this.loader.load(customerId);
       }
     }
     ```

---

### Q22: PostgreSQL Indexing Strategies for E-Commerce Orders: B-Tree, Partial, Composite, and BRIN
- **Context/Scenario:** An `orders` table contains 80 million rows spanning 4 years. Queries filtering by `customer_id` and `created_at` are slow. Furthermore, support dashboards frequently query orders with `status = 'REQUIRES_MANUAL_REVIEW'` (which represents only 0.2% of all rows). Sequential table scans are saturating disk I/O.
- **What to Look For (Evaluation Criteria):**
  - Designs Composite indexes adhering to the leftmost prefix rule and cardinality ordering (`(customer_id, created_at DESC)`).
  - Employs Partial indexes for sparse states and evaluates BRIN (Block Range Index) for append-only historical time-series data.
- **Detailed Answer / Explanation:**
  A one-size-fits-all B-Tree index on every column wastes disk space, memory buffer cache, and degrades write performance.

  **1. Composite Index for Customer History:**
  To optimize `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 20`:
  ```sql
  CREATE INDEX idx_orders_customer_created ON orders (customer_id, created_at DESC);
  ```
  PostgreSQL can satisfy both the equality filter on `customer_id` and the sorting operation directly from the index without an in-memory sort pass.

  **2. Partial Index for Rare States:**
  Querying orders needing manual intervention:
  ```sql
  -- Since only 0.2% of orders have this status, indexing the entire 80M rows is wasteful
  CREATE INDEX idx_orders_manual_review ON orders (created_at)
  WHERE status = 'REQUIRES_MANUAL_REVIEW';
  ```
  This partial index is tiny (a few kilobytes instead of gigabytes), easily fitting into RAM (`shared_buffers`).

  **3. BRIN (Block Range Index) for Historical Partitions:**
  For append-only tables where `created_at` physically correlates with table disk block storage:
  ```sql
  CREATE INDEX idx_orders_brin_created ON orders USING brin (created_at);
  ```
  A BRIN index is over 95% smaller than a B-Tree and scans block ranges efficiently for historical reports.

---

### Q23: Multi-Level Caching with Redis: Cache Stampede Mitigation and Eviction Policies
- **Context/Scenario:** The home page product catalog endpoint caches top products in Redis with a 5-minute TTL. When the cache expires at 12:00 PM during a marketing promotion, 10,000 incoming requests simultaneously hit Redis, miss the cache, and hammer PostgreSQL with identical queries, causing the database to crash ("Dogpiling" or "Cache Stampede").
- **What to Look For (Evaluation Criteria):**
  - Identifies Cache Stampede / Dogpiling and demonstrates mitigation strategies: Distributed Mutex Locking or Probabilistic Early Expiration (XFetch algorithm).
  - Configures Redis memory policies (`volatile-lru` vs `allkeys-lru`) and designs cache invalidation via pub/sub or event-driven invalidation.
- **Detailed Answer / Explanation:**
  When a high-traffic cache key expires, concurrent worker threads all observe a cache miss and simultaneously compute the expensive query.

  **Mitigation 1: Distributed Mutex Locking (Single Re-computation):**
  ```typescript
  async getTopProducts(): Promise<Product[]> {
    const cacheKey = 'catalog:top_products';
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const lockKey = 'lock:catalog:top_products';
    const acquired = await this.redis.set(lockKey, 'locked', 'NX', 'PX', 5000);

    if (acquired) {
      try {
        const freshData = await this.productRepo.findTopProducts();
        await this.redis.set(cacheKey, JSON.stringify(freshData), 'EX', 300);
        return freshData;
      } finally {
        await this.redis.del(lockKey);
      }
    } else {
      // Another worker is recalculating. Sleep 50ms and read from cache.
      await new Promise((r) => setTimeout(r, 50));
      return this.getTopProducts();
    }
  }
  ```

  **Mitigation 2: Probabilistic Early Expiration (XFetch):**
  Store both the value and the computation time $\Delta$. A worker refreshes the cache before expiration with probability:
  $e^{-\beta \cdot \text{remaining\_time} / \Delta} > \text{random}(0, 1)$.
  As the TTL approaches zero, the probability of a background refresh smoothly increases to 100%, ensuring zero client-facing cache misses.

---

### Q24: Node.js Event Loop Block Prevention: Offloading CPU-Bound Tasks to Worker Threads
- **Context/Scenario:** After each bulk order, the backend generates a password-protected PDF tax invoice using `pdfkit` and computes an SHA-512 cryptographic hash of document contents. During business peak hours, API health check endpoints (`/health`) timeout, and incoming HTTP requests drop connections with `ETIMEDOUT`.
- **What to Look For (Evaluation Criteria):**
  - Explains the single-threaded nature of the Node.js event loop and how synchronous CPU-intensive work (PDF generation, cryptography, heavy JSON manipulation) blocks the event loop phases.
  - Implements Node.js `worker_threads` (or `Piscina` thread pool) or delegates CPU tasks to an asynchronous background worker service.
- **Detailed Answer / Explanation:**
  Node.js executes JavaScript on a single thread. When a synchronous CPU-bound task runs for 800ms, NO OTHER requests, I/O callbacks, or timers can execute during that window.

  **Solution: Node.js `worker_threads` with a Reusable Pool (Piscina):**
  ```typescript
  // invoice.worker.ts
  import { parentPort } from 'node:worker_threads';
  import PDFDocument from 'pdfkit';

  parentPort?.on('message', async ({ invoiceData }) => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      parentPort?.postMessage({ pdf: pdfBuffer });
    });
    // Build complex PDF tables...
    doc.end();
  });

  // invoice.service.ts
  import Piscina from 'piscina';

  @Injectable()
  export class InvoiceService {
    private pool = new Piscina({
      filename: path.resolve(__dirname, 'invoice.worker.js'),
      maxThreads: os.cpus().length - 1, // Leave 1 CPU core for the event loop
    });

    async generateInvoice(invoiceData: InvoiceDto): Promise<Buffer> {
      // Offloaded to OS thread pool; event loop stays 100% responsive
      return this.pool.run({ invoiceData });
    }
  }
  ```

---

### Q25: Database Connection Exhaustion and PGPool Sizing Under High Concurrency with PgBouncer
- **Context/Scenario:** You deploy 20 replicas of a NestJS order service on Kubernetes. Each pod initializes a default TypeORM connection pool of 20 connections (`max: 20`). During a traffic surge, total active connections reach 400. PostgreSQL crashes with `FATAL: remaining connection slots are reserved for non-replication superuser connections`.
- **What to Look For (Evaluation Criteria):**
  - Understands PostgreSQL process-per-connection architecture, memory consumption per backend process (~5-10MB RAM per connection), and connection context switching overhead.
  - Introduces PgBouncer for Transaction Pooling and calculates optimal pool sizing using Little's Law / PostgreSQL formulas: `pool_size = (core_count * 2) + effective_spindle_count`.
- **Detailed Answer / Explanation:**
  Unlike MySQL or Node.js, PostgreSQL forks an operating system process for each connection. Hundreds of idle or semi-active connections consume gigabytes of RAM and waste CPU on kernel process scheduling and lock management.

  **Architecture Strategy:**
  1. **Introduce PgBouncer in Transaction Pooling Mode:**
     Instead of maintaining 400 direct connections to PostgreSQL, point all 20 NestJS pods to a PgBouncer instance. PgBouncer maintains a tight, permanent pool of ~30-50 connections to the PostgreSQL primary database.
  2. **Transaction Pooling Caveat:**
     In `pool_mode = transaction`, a PostgreSQL connection is only held for the duration of a single `BEGIN ... COMMIT` block. Features that bind state to a session (e.g., `SET search_path`, `LISTEN/NOTIFY`, prepared statements without names, advisory locks) must be handled with care or configured using `server_reset_query`.
  3. **NestJS Client Pool Sizing:**
     Configure each NestJS pod with a low pool size (e.g., `max: 5-10`). The math:
     $\text{Max Connections} = \text{Replicas} \times \text{Pool per replica} \le \text{PgBouncer client limit}$.

---

### Q26: Securing NestJS APIs: JWT Authentication, Refresh Token Rotation, and Revocation
- **Context/Scenario:** An authenticated admin user's laptop was stolen. The system issues stateless JWT access tokens with a 7-day expiration. Even after an administrator updates the user's password and triggers "Sign Out All Devices", the stolen token remains fully valid, allowing unauthorized API access for the remainder of the week.
- **What to Look For (Evaluation Criteria):**
  - Discusses short-lived access tokens (5-15 mins) paired with rotating refresh tokens stored securely (e.g., HTTP-only cookies).
  - Implements token blacklisting/revocation via Redis (storing `jti` or user `tokenVersion`) to invalidate active tokens instantly upon logout or compromise.
- **Detailed Answer / Explanation:**
  Purely stateless JWTs cannot be revoked before their expiration without a stateful check.

  **Production Implementation Pattern:**
  1. **Short-Lived Access Token (10 minutes):** Contains user ID, roles, and unique Token ID (`jti`).
  2. **Long-Lived Refresh Token (7 days) with Automatic Rotation:** Each refresh token can be used exactly once. Upon use, it is invalidated and replaced with a new pair. If a revoked refresh token is re-submitted, detect reuse and immediately revoke all tokens belonging to that user.
  3. **Instant Invalidation via User `tokenVersion` or Redis Blacklist:**
     ```typescript
     // auth.service.ts
     async revokeAllUserSessions(userId: string): Promise<void> {
       // Increment tokenVersion in database or Redis
       await this.userRepo.increment({ id: userId }, 'tokenVersion', 1);
       // Clear Redis session keys
       await this.redis.del(`sessions:${userId}`);
     }

     // jwt.strategy.ts
     @Injectable()
     export class JwtStrategy extends PassportStrategy(Strategy) {
       constructor(private readonly userRepo: UserRepository) {
         super({
           jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
           secretOrKey: process.env.JWT_SECRET,
         });
       }

       async validate(payload: JwtPayload) {
         // Fast O(1) verification: compare payload tokenVersion with active version
         const currentVersion = await this.redis.get(`token_ver:${payload.sub}`);
         if (currentVersion && Number(currentVersion) !== payload.version) {
           throw new UnauthorizedException('Token has been revoked.');
         }
         return { id: payload.sub, roles: payload.roles };
       }
     }
     ```

---

### Q27: Rate Limiting and Abuse Prevention via Sliding Window Algorithms with Redis
- **Context/Scenario:** Bad actors are executing credential stuffing and scraping pricing endpoints using distributed botnets. A fixed-window rate limiter allowed 100 requests per minute. Attackers circumvented this by sending 100 requests at 11:59:59 and another 100 requests at 12:00:01, bursting 200 requests within 2 seconds without triggering the limiter.
- **What to Look For (Evaluation Criteria):**
  - Analyzes fixed-window vs. sliding-window log vs. token bucket algorithms.
  - Implements `@nestjs/throttler` with Redis storage or writes an atomic Redis Lua sliding-window counter.
- **Detailed Answer / Explanation:**
  Fixed-window counters reset at rigid boundary intervals, allowing $2 \times \text{limit}$ bursts at boundary boundaries. The **Sliding Window Log** evaluates a rolling time window.

  **Redis Sliding Window Lua Script:**
  ```lua
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local clearBefore = now - window

  -- Remove all requests older than the sliding window
  redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)

  -- Count remaining requests in the current window
  local currentRequests = redis.call('ZCARD', key)

  if currentRequests < limit then
      -- Add current request timestamp
      redis.call('ZADD', key, now, now)
      redis.call('EXPIRE', key, math.ceil(window / 1000))
      return 1 -- Allowed
  else
      return 0 -- Throttled
  end
  ```

  In NestJS, configure `@nestjs/throttler` with `ThrottlerStorageRedisService` to share counters across all clustered application instances:
  ```typescript
  ThrottlerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      throttlers: [{ ttl: 60000, limit: 100 }],
      storage: new ThrottlerStorageRedisService(config.get('REDIS_URL')),
    }),
  });
  ```

---

### Q28: Data Sanitization, Strict Validation Pipes, and Prototype Pollution Defense
- **Context/Scenario:** An attacker submits a crafted JSON payload `{ "constructor": { "prototype": { "isAdmin": true } } }` to an endpoint that uses an unvalidated `Object.assign()` in a NestJS controller. Later, a regular user is granted administrative privileges.
- **What to Look For (Evaluation Criteria):**
  - Explains Prototype Pollution vulnerabilities in Node.js and SQL injection attack vectors when building dynamic SQL queries.
  - Enforces global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true` using `class-validator` and `class-transformer`.
- **Detailed Answer / Explanation:**
  Prototype pollution occurs when user-controlled object keys modify `Object.prototype`, affecting all JavaScript objects across the entire Node.js runtime process.

  **Defense Strategies:**
  1. **Strict Global Validation Pipe:**
     ```typescript
     // main.ts
     app.useGlobalPipes(
       new ValidationPipe({
         whitelist: true, // Strips any property not defined in the DTO
         forbidNonWhitelisted: true, // Throws 400 Bad Request if extra keys exist
         transform: true, // Automatically transforms payloads to DTO class instances
         transformOptions: { enableImplicitConversion: false },
       }),
     );
     ```
  2. **Safe Object Merging:** Avoid naive recursive merge functions or vulnerable libraries. Use `Object.assign(Object.create(null), ...)` or sanitized maps.
  3. **Parameterized Queries Against SQL Injection:** Never interpolate strings into queries:
     `repo.createQueryBuilder().where("order.code = '" + userInput + "'")` // VULNERABLE!
     Always use parameterized parameters:
     `repo.createQueryBuilder().where("order.code = :code", { code: userInput })`.

---

### Q29: Zero-Downtime Database Migrations: The Expand/Contract (Parallel Run) Pattern
- **Context/Scenario:** You need to rename a column `phone_number` to `contact_msisdn` in a high-traffic `customers` table (1000 writes/second). Running `ALTER TABLE customers RENAME COLUMN phone_number TO contact_msisdn;` in a standard TypeORM migration immediately locked the table, caused write queries to queue up, and brought down the API during deployment.
- **What to Look For (Evaluation Criteria):**
  - Explains why destructive migrations (`RENAME COLUMN`, `DROP COLUMN`, changing data types synchronously) violate zero-downtime requirements due to table locks and old application code running concurrently.
  - Details the Expand/Contract (Parallel Run) pattern across multiple progressive deployments.
- **Detailed Answer / Explanation:**
  During a rolling Kubernetes deployment, both the old version of the app (which expects `phone_number`) and the new version (which expects `contact_msisdn`) run concurrently. Renaming the column breaks the old version immediately.

  **The 4-Phase Expand/Contract Pattern:**
  - **Phase 1 (Expand - Migration):** Add the new column without dropping the old one:
    ```sql
    ALTER TABLE customers ADD COLUMN contact_msisdn VARCHAR(32);
    CREATE INDEX CONCURRENTLY idx_customers_msisdn ON customers (contact_msisdn);
    ```
  - **Phase 2 (Dual-Write - Application Deployment 1):** Update backend code to write to BOTH `phone_number` and `contact_msisdn`, but still read from `phone_number`.
  - **Phase 3 (Backfill - Background Job):** Run an asynchronous script to copy historical data from `phone_number` to `contact_msisdn` in small batches (`LIMIT 1000` to avoid long row locks).
  - **Phase 4 (Contract - Application Deployment 2):** Update backend code to read and write exclusively to `contact_msisdn`.
  - **Phase 5 (Cleanup - Final Migration):** Once verified, drop the old column:
    ```sql
    ALTER TABLE customers DROP COLUMN phone_number;
    ```

---

### Q30: Sensitive Data Protection: PCI-DSS, Column-Level Encryption, and PII Masking
- **Context/Scenario:** Customer payment cards and Social Security Numbers are stored in your database. A junior developer logged full HTTP request bodies (`console.log(req.body)`), spilling raw credit card numbers into centralized logging (Datadog/CloudWatch), violating PCI-DSS and GDPR regulations.
- **What to Look For (Evaluation Criteria):**
  - Discusses envelope encryption (AES-256-GCM) with AWS KMS / HashiCorp Vault for sensitive column data at rest.
  - Implements custom Winston/Pino logger redactors and NestJS interceptors to automatically scrub sensitive PII fields (`cardNumber`, `cvv`, `password`).
- **Detailed Answer / Explanation:**
  Storing or logging raw card numbers violates PCI-DSS. Under PCI-DSS, raw primary account numbers (PAN) must never touch your internal databases; instead, leverage payment gateway tokenization (Stripe Elements / tokenization).

  For unavoidable PII (SSN, national IDs):
  1. **Column-Level Encryption (AES-256-GCM):**
     ```typescript
     @Injectable()
     export class EncryptionService {
       private readonly algorithm = 'aes-256-gcm';
       private readonly key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

       encrypt(text: string): { ciphertext: string; iv: string; tag: string } {
         const iv = crypto.randomBytes(16);
         const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
         let encrypted = cipher.update(text, 'utf8', 'hex');
         encrypted += cipher.final('hex');
         return {
           ciphertext: encrypted,
           iv: iv.toString('hex'),
           tag: cipher.getAuthTag().toString('hex'),
         };
       }
     }
     ```
  2. **Automated Logging Redaction:**
     Use Pino's built-in redaction in NestJS:
     ```typescript
     PinoLoggerModule.forRoot({
       pinoHttp: {
         redact: {
           paths: ['req.headers.authorization', 'req.body.cardNumber', 'req.body.cvv', 'req.body.password', '*.ssn'],
           censor: '[REDACTED_PII]',
         },
       },
     });
     ```

---

## Tier 4: Testing, CI/CD & Deployment Pipelines

### Q31: Unit Testing NestJS Services with Mock Repositories and Jest
- **Context/Scenario:** A developer wrote unit tests for `OrderService.createOrder()` that made actual network calls to a running local database and Stripe API. When run on CI without database credentials, the test suite crashed. Moreover, the tests ran for 4 minutes and failed intermittently due to network jitter.
- **What to Look For (Evaluation Criteria):**
  - Isolates business logic by mocking dependencies with Jest (`jest.fn()`, `Test.createTestingModule()`).
  - Distinguishes between state-based testing and interaction/behavior verification, testing both success and error paths (e.g., repository throws exception, payment fails).
- **Detailed Answer / Explanation:**
  True unit tests must run in memory, have zero external I/O dependencies, and execute in milliseconds.

  ```typescript
  describe('OrderService', () => {
    let service: OrderService;
    let orderRepo: jest.Mocked<Repository<OrderEntity>>;
    let paymentGateway: jest.Mocked<PaymentGatewayService>;

    beforeEach(async () => {
      const mockOrderRepo = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
      };
      const mockPaymentGateway = {
        charge: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OrderService,
          { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
          { provide: PaymentGatewayService, useValue: mockPaymentGateway },
        ],
      }).compile();

      service = module.get<OrderService>(OrderService);
      orderRepo = module.get(getRepositoryToken(OrderEntity));
      paymentGateway = module.get(PaymentGatewayService);
    });

    it('should throw BadRequestException if payment fails and not persist order', async () => {
      paymentGateway.charge.mockRejectedValue(new Error('Card declined'));

      await expect(
        service.createOrder({ customerId: 'cust-1', amount: 100 })
      ).rejects.toThrow(BadRequestException);

      expect(paymentGateway.charge).toHaveBeenCalledTimes(1);
      expect(orderRepo.save).not.toHaveBeenCalled(); // Verify invariant
    });
  });
  ```

---

### Q32: Integration Testing with Real PostgreSQL and Redis Instances using Testcontainers
- **Context/Scenario:** Unit tests with mocked repositories pass 100% of the time, but production deployments frequently fail due to PostgreSQL-specific syntax errors (e.g., `ON CONFLICT DO UPDATE`, `JSONB` operators, or foreign key constraint violations) that Jest mocks never caught.
- **What to Look For (Evaluation Criteria):**
  - Employs Testcontainers (`@testcontainers/postgresql`, `@testcontainers/redis`) to spin up real, ephemeral Docker containers for integration tests.
  - Explains database isolation per test suite (running migrations on startup, transaction rollbacks or database truncation between tests).
- **Detailed Answer / Explanation:**
  Mocks cannot validate database dialect fidelity, triggers, constraints, or complex SQL queries. **Testcontainers** provides real Dockerized PostgreSQL and Redis instances for automated CI testing.

  ```typescript
  import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
  import { DataSource } from 'typeorm';

  describe('OrderRepository Integration Test (Real Postgres)', () => {
    let container: StartedPostgreSqlContainer;
    let dataSource: DataSource;
    let repo: OrderRepository;

    beforeAll(async () => {
      container = await new PostgreSqlContainer('postgres:16-alpine')
        .withDatabase('test_db')
        .withUsername('test')
        .withPassword('test')
        .start();

      dataSource = new DataSource({
        type: 'postgres',
        url: container.getConnectionUri(),
        entities: [OrderEntity, OrderItemEntity],
        synchronize: true, // or run real migrations
      });
      await dataSource.initialize();
      repo = new OrderRepository(dataSource);
    }, 60000);

    afterAll(async () => {
      await dataSource.destroy();
      await container.stop();
    });

    it('should enforce unique constraint on order idempotency key', async () => {
      const order1 = { orderNumber: 'ORD-101', idempotencyKey: 'key-abc', total: 50 };
      await repo.insertOrder(order1);

      // Verify that real PostgreSQL throws a 23505 unique violation code
      await expect(repo.insertOrder(order1)).rejects.toThrow(/duplicate key value/);
    });
  });
  ```

---

### Q33: End-to-End (E2E) Testing of Distributed Order Workflows with Supertest
- **Context/Scenario:** A company needs to ensure that the entire HTTP pipeline—including authentication guards, custom pipes, validation, interceptors, controllers, services, database transactions, and error filters—functions correctly when an order is created.
- **What to Look For (Evaluation Criteria):**
  - Sets up NestJS E2E test module using `supertest` with full pipeline lifecycle hooks (`app.init()`).
  - Handles test state cleanup (database seeding and teardown) without leaking data between test suites.
- **Detailed Answer / Explanation:**
  E2E tests verify the external HTTP boundary of the application without mocking internal layers.

  ```typescript
  import request from 'supertest';
  import { INestApplication, ValidationPipe } from '@nestjs/common';
  import { Test } from '@nestjs/testing';
  import { AppModule } from '../src/app.module';

  describe('Orders API (e2e)', () => {
    let app: INestApplication;
    let jwtToken: string;

    beforeAll(async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
      await app.init();

      // Seed auth token
      const authRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@acme.com', password: 'Password123!' });
      jwtToken = authRes.body.accessToken;
    });

    afterAll(async () => {
      await app.close();
    });

    it('POST /orders should validate payload and return 201 with created order', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          items: [{ productId: 'prod-001', quantity: 2, price: 29.99 }],
          shippingAddress: '123 Main St, New York, NY',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('PENDING');
      expect(response.body.totalAmount).toBe(59.98);
    });

    it('POST /orders should return 400 Bad Request if quantity is non-positive', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          items: [{ productId: 'prod-001', quantity: -5, price: 29.99 }],
        })
        .expect(400);
    });
  });
  ```

---

### Q34: Consumer-Driven Contract Testing Between Microservices Using Pact
- **Context/Scenario:** The `OrderService` consumes an internal REST API from `InventoryService`. After `InventoryService` renamed a JSON field from `available_quantity` to `availableStock`, the staging and production environments broke because neither team noticed the schema drift during development.
- **What to Look For (Evaluation Criteria):**
  - Explains the philosophy of Consumer-Driven Contract Testing (CDCT) using tools like **Pact**.
  - Illustrates the workflow: Consumer writes pact contract test -> publishes contract to Pact Broker -> Provider validates contract in its CI pipeline before deployment (`can-i-deploy`).
- **Detailed Answer / Explanation:**
  Traditional integration tests between microservices in shared staging environments are slow, flaky, and hard to orchestrate. Consumer-Driven Contract Testing ensures compatibility before code leaves developer branches.

  **Workflow with Pact:**
  1. **Consumer (`OrderService`):**
     Writes a test that specifies expected requests and responses:
     ```typescript
     await pactProvider.addInteraction({
       state: 'product prod-123 exists with stock',
       uponReceiving: 'a request for product stock',
       withRequest: {
         method: 'GET',
         path: '/inventory/prod-123',
       },
       willRespondWith: {
         status: 200,
         body: {
           productId: Matchers.string('prod-123'),
           availableStock: Matchers.integer(10), // Required contract field
         },
       },
     });
     ```
     Running the test generates a `pact.json` file, which is published to the Pact Broker.
  2. **Provider (`InventoryService`):**
     In CI, `InventoryService` pulls contracts from the Pact Broker and verifies that its actual controller responses satisfy the consumer's expectations.
  3. **Release Gate:**
     The CI pipeline runs `pact-broker can-i-deploy`. If a breaking field rename is detected, the deployment is blocked automatically.

---

### Q35: Automated Database Migration Verification in CI/CD Before Deployment
- **Context/Scenario:** A developer merged a TypeORM migration script containing an invalid SQL statement and a foreign key constraint without an index. The deployment failed halfway through on the production database, leaving the migration table locked and the schema in an indeterminate state.
- **What to Look For (Evaluation Criteria):**
  - Designs an automated CI pipeline stage that spins up an ephemeral PostgreSQL instance, runs all migrations from scratch, and executes `migration:revert` to verify reversibility.
  - Explains database migration safety rules: never drop columns in a single release; always use transactional migration flags and query timeouts.
- **Detailed Answer / Explanation:**
  Migrations should be treated as production code and rigorously verified in automated CI gates prior to reaching deployment pipelines.

  **CI Pipeline Migration Verification Steps:**
  1. **Spin Up Ephemeral Target DB:** In GitHub Actions, spin up a fresh PostgreSQL service container matching production's version.
  2. **Forward Migration Test:** Run `npm run typeorm migration:run`. Assert exit code 0.
  3. **Rollback Verification Test:** Run `npm run typeorm migration:revert` for all newly introduced migration files. Ensure that down-migrations execute without syntax errors.
  4. **Re-Apply & Schema Diff Check:** Re-run migrations and compare the resulting schema with the TypeORM entity metadata definition (`typeorm schema:log` or `prisma migrate diff`) to ensure zero un-migrated entity drift.

  ```yaml
  # .github/workflows/ci.yml
  test-migrations:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: root
          POSTGRES_DB: migration_test
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - name: Run Migrations Up
        run: npm run typeorm migration:run
      - name: Run Migrations Down (Rollback test)
        run: npm run typeorm migration:revert
      - name: Re-apply Migrations
        run: npm run typeorm migration:run
  ```

---

### Q36: Docker Multi-Stage Builds for NestJS: Image Size Optimization and Security Hardening
- **Context/Scenario:** A production Docker container for a NestJS application is 1.8GB in size, runs as the `root` user, and includes development dependencies (`typescript`, `@types/*`, Jest, ESLint) along with full source code and `.git` directories, triggering severe security scan vulnerabilities.
- **What to Look For (Evaluation Criteria):**
  - Employs Docker Multi-Stage builds separating build environment (`node:20-alpine`) from lean production runtime.
  - Drops root privileges (`USER node`), prunes `devDependencies` (`npm prune --omit=dev`), and utilizes distroless or lightweight Alpine images (<150MB).
- **Detailed Answer / Explanation:**
  A secure, production-grade Dockerfile isolates compiler tools from runtime artifacts and runs as an unprivileged user:

  ```dockerfile
  # Stage 1: Build & Compile
  FROM node:20-alpine AS builder
  WORKDIR /usr/src/app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build
  RUN npm prune --omit=dev

  # Stage 2: Production Runtime
  FROM node:20-alpine AS runner
  WORKDIR /usr/src/app
  ENV NODE_ENV=production

  # Security: Do not run as root
  USER node

  # Copy only the compiled output and production node_modules
  COPY --chown=node:node --from=builder /usr/src/app/package*.json ./
  COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
  COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

  EXPOSE 3000
  CMD ["node", "dist/main.js"]
  ```
  Result: Image size is slashed from 1.8GB to ~130MB, attack surface is minimized, compiler tools are excluded, and running as unprivileged user `node` blocks container escape exploits.

---

### Q37: Blue-Green vs. Canary Deployments for Microservices: Traffic Splitting and Rollback
- **Context/Scenario:** You are deploying a high-stakes checkout service refactor to Kubernetes. You need a zero-downtime deployment strategy that lets you validate new logic with 2% of real production users before rolling it out to 100%, with automated instant rollback if error rates spike.
- **What to Look For (Evaluation Criteria):**
  - Contrasts Blue-Green deployment (all-or-nothing instant switch) with Canary deployment (gradual percentage-based traffic shifting).
  - Outlines Canary orchestration with service meshes (Istio/Linkerd) or Kubernetes Ingress controllers (Argo Rollouts, Flagger) driven by Prometheus error-rate metrics.
- **Detailed Answer / Explanation:**
  - **Blue-Green Deployment:** Two identical environments (Blue = Live, Green = New). Green is fully deployed and tested internally; router switches 100% of traffic from Blue to Green. Fast rollback (switch router back to Blue), but requires $2\times$ the infrastructure capacity and exposes all users to potential regressions immediately upon cutover.
  - **Canary Deployment (Recommended for High-Risk Order Services):** Deploys the new version alongside the existing version and routes a tiny fraction of real user traffic (e.g., 2%, 10%, 50%, 100%).

  **Argo Rollouts Canary Configuration:**
  ```yaml
  apiVersion: argoproj.io/v1alpha1
  kind: Rollout
  metadata:
    name: order-service
  spec:
    strategy:
      canary:
        steps:
          - setWeight: 5
          - pause: { duration: 10m } # Monitor Prometheus metrics
          - setWeight: 25
          - pause: { duration: 15m }
          - setWeight: 100
        analysis:
          templates:
            - templateName: success-rate-check
  ```
  If Prometheus detects that HTTP 5xx responses exceed 0.5% or p99 latency exceeds 400ms during any pause window, Argo Rollouts aborts the canary, scales the canary deployment to 0, and restores 100% traffic to stable pods within seconds.

---

### Q38: Automated Static Analysis, Linting, Type-Checking, and Security Scanning in CI
- **Context/Scenario:** Multiple bugs recently slipped into production: a TypeScript `any` cast caused an undefined variable crash, a vulnerable version of `axios` with an active CVE was introduced, and an AWS secret access key was accidentally committed to a branch.
- **What to Look For (Evaluation Criteria):**
  - Structures a comprehensive CI linting and security gate (GitHub Actions) including `tsc --noEmit`, ESLint with strict TypeScript rules, and GitGuardian/Trufflehog secret scanning.
  - Integrates Software Composition Analysis (SCA) with Snyk/Trivy/`npm audit` to catch supply-chain vulnerabilities.
- **Detailed Answer / Explanation:**
  Production CI pipelines should enforce defense-in-depth across multiple static analysis dimensions:

  ```yaml
  name: Quality & Security Gate
  on: [pull_request]
  jobs:
    code-quality:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: 20, cache: 'npm' }
        - run: npm ci

        # 1. Type Safety (No implicit any, strict null checks)
        - name: Strict TypeScript Compilation
          run: npx tsc --noEmit

        # 2. Code Standards & Anti-Patterns
        - name: Linting
          run: npm run lint

        # 3. Secret Leak Scanning
        - name: Secret Scan (TruffleHog)
          uses: trufflesecurity/trufflehog@main
          with:
            path: ./
            base: ${{ github.event.repository.default_branch }}
            head: HEAD

        # 4. Dependency Vulnerabilities (SCA)
        - name: Vulnerability Audit
          run: npm audit --audit-level=high

        # 5. Container Security Scan
        - name: Container Image Scan (Trivy)
          uses: aquasecurity/trivy-action@master
          with:
            image-ref: 'acme/order-service:${{ github.sha }}'
            exit-code: '1'
            severity: 'CRITICAL,HIGH'
  ```

---

### Q39: Synthetic Traffic Generation and Load Testing with k6: Identifying p95/p99 Latency
- **Context/Scenario:** Before Black Friday, the business expects 5,000 orders/minute. The backend team claims the system is "fast" based on local manual Postman requests that take 25ms. You are tasked with designing and executing a formal load test to find the true breaking point of the order platform.
- **What to Look For (Evaluation Criteria):**
  - Designs realistic synthetic traffic scenarios using modern tools like **k6** or **Artillery** (ramping virtual users, realistic think-time, representative data pools).
  - Measures percentiles (p50, p95, p99) and error rate thresholds rather than misleading arithmetic averages.
- **Detailed Answer / Explanation:**
  Arithmetic averages hide severe tail latencies (e.g., an average of 40ms can hide the fact that 5% of users wait 8,000ms due to connection pool locks).

  **k6 Load Testing Script:**
  ```javascript
  import http from 'k6/http';
  import { check, sleep } from 'k6';

  export const options = {
    stages: [
      { duration: '2m', target: 100 },  // Warm up
      { duration: '5m', target: 1000 }, // Ramp to peak load
      { duration: '2m', target: 2000 }, // Stress test beyond capacity
      { duration: '2m', target: 0 },    // Scale down
    ],
    thresholds: {
      http_req_failed: ['rate<0.01'], // <1% errors
      http_req_duration: ['p(95)<300', 'p(99)<800'], // 95% under 300ms, 99% under 800ms
    },
  };

  export default function () {
    const payload = JSON.stringify({
      customerId: `cust-${__VU}`,
      items: [{ productId: 'prod-99', quantity: 1, price: 100 }],
    });

    const res = http.post('https://staging-api.acme.com/v1/orders', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': `k6-${__VU}-${__ITER}`,
      },
    });

    check(res, {
      'status is 201': (r) => r.status === 201,
      'response has id': (r) => JSON.parse(r.body).id !== undefined,
    });

    sleep(Math.random() * 2 + 1); // Realistic user think time (1-3s)
  }
  ```

---

### Q40: Feature Toggles and Trunk-Based Development with Unleash / LaunchDarkly
- **Context/Scenario:** Your engineering organization is struggling with long-lived git feature branches that take 3 weeks to merge, resulting in painful merge conflicts and high-risk deployments. Management mandates a shift to Trunk-Based Development with daily deployments to `main`.
- **What to Look For (Evaluation Criteria):**
  - Articulates Trunk-Based Development mechanics: small, frequent commits merged to `main` multiple times a day behind feature flags.
  - Implements dynamic feature flags with Unleash or LaunchDarkly in NestJS, supporting user-targeting, percentage rollouts, and kill-switches.
- **Detailed Answer / Explanation:**
  Trunk-Based Development decouples **code deployment** from **feature release**. Unfinished features are deployed to production safely behind feature toggles.

  ```typescript
  @Injectable()
  export class FeatureFlagService {
    constructor(private readonly unleash: UnleashService) {}

    isEnabled(flagName: string, context?: { userId?: string; tenantId?: string }): boolean {
      return this.unleash.isEnabled(flagName, {
        userId: context?.userId,
        properties: { tenantId: context?.tenantId },
      });
    }
  }

  // Inside OrderCheckoutService
  @Injectable()
  export class CheckoutService {
    constructor(
      private readonly flags: FeatureFlagService,
      private readonly legacyEngine: LegacyCheckoutEngine,
      private readonly optimizedEngine: OptimizedV2CheckoutEngine,
    ) {}

    async processOrder(order: OrderDto, user: UserContext): Promise<OrderResult> {
      // Dynamic gradual rollout: 10% of users see new engine
      if (this.flags.isEnabled('checkout-engine-v2', { userId: user.id })) {
        return this.optimizedEngine.process(order);
      }
      return this.legacyEngine.process(order);
    }
  }
  ```
  If an unexpected bug occurs in production, the engineering team can flip the toggle to `OFF` in the Unleash dashboard within 5 seconds—acting as an immediate kill-switch without triggering an emergency redeployment.

---

## Tier 5: Production Incident Troubleshooting & Refactoring

### Q41: Diagnosing and Fixing Node.js Memory Leaks in Production with Heap Snapshots
- **Context/Scenario:** Every 36 hours, your NestJS order processing container runs out of memory and crashes with `OOMKilled` (Exit Code 137) in Kubernetes. Memory graphs show a classic "sawtooth" curve where memory usage steadily climbs from 200MB to 2GB without ever being reclaimed by the V8 Garbage Collector.
- **What to Look For (Evaluation Criteria):**
  - Explains common Node.js memory leak culprits (unbounded in-memory arrays/caches, unremoved EventEmitter listeners, closures capturing large outer scopes, unhandled stream buffers).
  - Outlines the step-by-step diagnostic workflow: capturing multiple V8 Heap Snapshots (`v8.writeHeapSnapshot()`), comparing delta retainers in Chrome DevTools / Clinic.js, and fixing the root cause.
- **Detailed Answer / Explanation:**
  A process-terminating memory leak indicates that objects are retained in the V8 heap by active root references, preventing garbage collection.

  **Diagnostic Procedure:**
  1. **Trigger On-Demand Heap Snapshots:**
     Expose a secure management endpoint or use `SIGUSR2` to dump snapshots:
     ```typescript
     import v8 from 'node:v8';
     import fs from 'node:fs';

     @Injectable()
     export class DiagnosticsService {
       takeSnapshot(): string {
         const fileName = `/tmp/heap-${Date.now()}.heapsnapshot`;
         v8.writeHeapSnapshot(fileName);
         return fileName;
       }
     }
     ```
  2. **Compare Snapshots in Chrome DevTools:**
     Take Snapshot 1 at baseline boot. Take Snapshot 2 after 10,000 requests. Inspect the **Comparison View** sorted by **Alloc Size** and **# Delta**.
  3. **Common Culprit & Fix in NestJS:**
     - **Unbounded Global In-Memory Caches:** Using a plain `new Map()` or JavaScript object as a cache without an eviction policy. Replace with a bounded LRU cache (`lru-cache` with `max: 5000`).
     - **Dangling Event Listeners:** Attaching `eventEmitter.on()` inside request handlers without calling `removeListener()`. Each request adds a new closure retained forever in memory.
     - **Large Object Closures:** Retaining an entire HTTP `request` object inside a long-lived timer or promise chain.

---

### Q42: PostgreSQL Lock Contention and Deadlock Resolution in High-Volume Order Updates
- **Context/Scenario:** Under high concurrent order fulfillment activity, multiple backend workers are updating orders and inventory. PostgreSQL starts throwing `ERROR: deadlock detected (SQLSTATE 40P01): Process 18420 waits for ShareLock on transaction 91241... Process 19102 waits for ExclusiveLock on transaction 91238`. Several critical customer orders fail.
- **What to Look For (Evaluation Criteria):**
  - Explains the conditions that create deadlocks: concurrent transactions acquiring exclusive locks on multiple shared resources in differing chronological orders (Transaction A locks Row 1 then Row 2; Transaction B locks Row 2 then Row 1).
  - Resolves deadlocks systematically: deterministic resource locking order (e.g., sorting IDs before acquiring locks), statement timeouts, and transactional retry loops.
- **Detailed Answer / Explanation:**
  Deadlocks occur when two or more transactions hold locks that the other needs to complete, forming a circular wait condition.

  **Example of Deadlock Scenario:**
  - *Worker 1:* Locks Order 100, then attempts to lock Inventory Item A.
  - *Worker 2:* Locks Inventory Item A, then attempts to lock Order 100.
  Both processes wait on each other until PostgreSQL's `deadlock_timeout` (default 1s) detects the cycle and aborts one transaction.

  **Systematic Prevention & Resolution:**
  1. **Deterministic Resource Locking Order (Crucial Rule):**
     Always acquire locks in a globally consistent order (e.g., sort entity IDs alphabetically/numerically before locking):
     ```typescript
     // When reserving multiple inventory items in a single transaction:
     const sortedItemIds = [...itemIds].sort(); // Ensure deterministic lock sequence

     for (const itemId of sortedItemIds) {
       await queryRunner.query(
         'SELECT * FROM inventory WHERE id = $1 FOR UPDATE',
         [itemId]
       );
     }
     ```
  2. **Minimize Lock Duration:** Never perform third-party HTTP network calls (e.g., Stripe, PayPal) inside an open PostgreSQL database transaction.
  3. **Automatic Deadlock Retry Handler:**
     Wrap transactions in an exponential backoff retry loop that specifically catches PostgreSQL error code `40P01` (deadlock detected) and retries the operation.

---

### Q43: Distributed Tracing with OpenTelemetry, Jaeger, and AsyncLocalStorage
- **Context/Scenario:** An end-to-end checkout flow touches 5 microservices (`api-gateway`, `order-service`, `payment-service`, `inventory-service`, `notification-service`). A user reported that their checkout took 12 seconds, but standard logging output across 5 separate Datadog/CloudWatch logs lacks correlation, making it impossible to know which service or database query caused the delay.
- **What to Look For (Evaluation Criteria):**
  - Implements W3C Trace Context standards (`traceparent`, `tracestate`) using OpenTelemetry SDK in Node.js.
  - Utilizes Node.js `AsyncLocalStorage` to propagate correlation IDs and trace spans across asynchronous execution contexts without passing context arguments manually through every function.
- **Detailed Answer / Explanation:**
  Without distributed tracing, diagnosing multi-service performance bottlenecks is guesswork.

  **1. OpenTelemetry Auto-Instrumentation Setup (`tracer.ts`):**
  Must be initialized before any other imports in `main.ts`:
  ```typescript
  import { NodeSDK } from '@opentelemetry/sdk-node';
  import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
  import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({ url: 'http://jaeger-collector:4318/v1/traces' }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
  ```

  **2. Context Propagation with `AsyncLocalStorage`:**
  To maintain a unified `correlationId` across all log messages:
  ```typescript
  export const requestContext = new AsyncLocalStorage<{ correlationId: string }>();

  // correlation.middleware.ts
  @Injectable()
  export class CorrelationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
      const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
      res.setHeader('x-correlation-id', correlationId);

      requestContext.run({ correlationId }, () => {
        next();
      });
    }
  }

  // logger.service.ts
  @Injectable()
  export class AppLogger {
    log(message: string) {
      const store = requestContext.getStore();
      const traceId = store?.correlationId || 'no-trace';
      console.log(JSON.stringify({ timestamp: new Date(), traceId, message }));
    }
  }
  ```

---

### Q44: Post-Mortem Analysis of a Silent Message Queue Lag Explosion
- **Context/Scenario:** During an inventory synchronization batch run, the RabbitMQ/Kafka queue backing `OrderProcessingWorker` ballooned from 500 messages to 1,800,000 unconsumed messages. Consumers appeared active, but processing throughput dropped to near-zero. Management wants a root cause analysis (RCA) and architectural safeguards.
- **What to Look For (Evaluation Criteria):**
  - Identifies Poison Pill messages (unhandled message format causing crash/retry loops) and lack of consumer backpressure or prefetch tuning.
  - Implements Dead-Letter Queues (DLQ) with max retry counts, tunes consumer prefetch count (`channel.prefetch`), and configures alerting on consumer group lag metrics.
- **Detailed Answer / Explanation:**
  **RCA Breakdown:**
  1. **The Poison Pill:** A malformed payload caused an unhandled runtime exception in the consumer. Because the consumer rejected the message with `requeue = true`, RabbitMQ immediately redelivered the exact same message to the next worker. The worker crashed, redelivered again, saturating 100% of consumer CPU in an infinite hot-loop and starving all valid messages.
  2. **Unbounded Prefetch:** The workers had no `prefetch` limit configured (`prefetch: 0`), causing RabbitMQ to dump tens of thousands of unacknowledged messages into worker Node.js process memory, causing memory swapping and thread starvation.

  **Corrective Safeguards:**
  - **Dead-Letter Exchange (DLX) & Retry Count Limit:**
    Never blindly requeue unhandled errors. If a message fails validation or processing, increment an `x-retry-count` header. If `retryCount > 3`, route the message to `orders.dead-letter` exchange and acknowledge the original message:
    ```typescript
    try {
      await processOrderMessage(msg.content);
      channel.ack(msg);
    } catch (err) {
      const retries = (msg.properties.headers['x-retries'] || 0) + 1;
      if (retries >= 3) {
        channel.sendToQueue('orders.dlq', msg.content, { headers: { error: err.message } });
        channel.ack(msg); // Remove poison pill from main queue
      } else {
        channel.nack(msg, false, false); // Route to delayed retry topic
      }
    }
    ```
  - **Tune Consumer Prefetch:** Set `channel.prefetch(10)` so workers only buffer what they can immediately process.

---

### Q45: Graceful Shutdown and Connection Draining in NestJS Containers on Kubernetes
- **Context/Scenario:** Every time a new version of the order service is deployed to Kubernetes via rolling updates, active checkout transactions are abruptly killed. Users see `502 Bad Gateway` errors, and several database transactions are left incomplete or orphaned.
- **What to Look For (Evaluation Criteria):**
  - Explains the Kubernetes Pod termination lifecycle (`SIGTERM`, `preStop` hook, endpoint removal, `terminationGracePeriodSeconds`).
  - Implements NestJS `enableShutdownHooks()` and manages connection draining (closing HTTP server, waiting for in-flight requests, closing BullMQ workers and database pools gracefully).
- **Detailed Answer / Explanation:**
  When Kubernetes terminates a pod, it sends a `SIGTERM` signal. If an application exits immediately, active HTTP connections and database transactions are severed mid-flight.

  **1. Enable NestJS Shutdown Hooks (`main.ts`):**
  ```typescript
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableShutdownHooks(); // Listens for SIGTERM/SIGINT
    await app.listen(3000);
  }
  ```

  **2. Implement Lifecycle Cleaners (`OnApplicationShutdown`):**
  ```typescript
  @Injectable()
  export class QueueWorkerManager implements OnApplicationShutdown {
    constructor(private readonly worker: Worker) {}

    async onApplicationShutdown(signal?: string) {
      console.log(`Received ${signal}. Pausing queues and draining jobs...`);
      await this.worker.close(); // Stop accepting new jobs; await active jobs
    }
  }
  ```

  **3. Kubernetes Pod Lifecycle Configuration:**
  There is a race condition between Kubernetes removing the Pod IP from the Service Endpoints and sending `SIGTERM`. Add a `preStop` sleep hook in Kubernetes:
  ```yaml
  lifecycle:
    preStop:
      exec:
        command: ["/bin/sh", "-c", "sleep 10"] # Wait for Kube-proxy / Ingress routing to stop forwarding traffic
  terminationGracePeriodSeconds: 45
  ```

---

### Q46: Mitigating Cascading Failures in Microservices via Bulkheading and Adaptive Concurrency
- **Context/Scenario:** The `RecommendationService` slowed down to 10-second response times. Because `OrderService` called `RecommendationService` directly during cart checkout, all HTTP worker threads in `OrderService` were exhausted waiting for recommendations, causing the primary checkout endpoint to completely crash.
- **What to Look For (Evaluation Criteria):**
  - Explains the **Bulkhead Pattern**: isolating resources (thread pools, connection limits, memory) so that the failure of a non-critical component cannot exhaust critical path resources.
  - Implements strict client-side timeouts, separate HTTP connection pools, and graceful degradation (e.g., render checkout page with default popular items if recommendations fail).
- **Detailed Answer / Explanation:**
  A slow secondary service should NEVER be allowed to compromise primary transactional business operations.

  **Bulkheading Implementation:**
  1. **Resource Isolation:**
     Assign dedicated Axios/HTTP agent instances with limited max sockets for non-critical services:
     ```typescript
     @Injectable()
     export class RecommendationClient {
       private readonly http = axios.create({
         baseURL: process.env.RECOMMENDATIONS_URL,
         timeout: 800, // Strict 800ms timeout
         httpAgent: new http.Agent({ maxSockets: 10 }), // Bulkhead: max 10 sockets
       });

       async getRecommendedProducts(userId: string): Promise<ProductDto[]> {
         try {
           const res = await this.http.get(`/recommendations/${userId}`);
           return res.data;
         } catch (error) {
           // Graceful degradation: Fallback to cached default top-sellers
           return this.getDefaultTopSellers();
         }
       }
     }
     ```
  2. **Architectural Decoupling:**
     Make recommendation enrichment an asynchronous UI fetch or fetch it client-side directly from the browser, completely decoupling it from the server-side checkout transaction.

---

### Q47: Troubleshooting DNS Resolution Delays and Keep-Alive Socket Exhaustion in Node.js
- **Context/Scenario:** A NestJS service makes thousands of external HTTP calls per minute to suppliers. Periodically, outbound requests hang for 5 seconds before succeeding, and `netstat` shows tens of thousands of sockets in the `TIME_WAIT` state, eventually triggering `Error: connect EADDRNOTAVAIL`.
- **What to Look For (Evaluation Criteria):**
  - Identifies that Node.js default `http.globalAgent` disables HTTP Keep-Alive (`keepAlive: false`), forcing a new TCP handshake and DNS resolution per request, exhausting ephemeral OS ports (`TIME_WAIT`).
  - Implements persistent HTTP Keep-Alive agents (`http-agent` / `agentkeepalive`) and configures local DNS caching (via dns-cache or Alpine Linux nscd/dnsmasq).
- **Detailed Answer / Explanation:**
  By default, Node.js closes TCP connections after each HTTP request. Under high request volume:
  1. **Socket Exhaustion:** Closing thousands of connections per second leaves sockets lingering in the OS `TIME_WAIT` state (typically 60s), exhausting available ephemeral ports.
  2. **DNS Latency:** Node.js does not cache DNS lookups by default. Each outbound request invokes `dns.lookup()`, which uses the synchronous libuv thread pool (`UV_THREADPOOL_SIZE`).

  **Production Fix: Custom Keep-Alive Agent:**
  ```typescript
  import Agent from 'agentkeepalive';
  import { HttpsAgent } from 'agentkeepalive';

  export const persistentHttpAgent = new Agent({
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 60000,
    freeSocketTimeout: 30000, // Keep socket open for 30s
  });

  export const persistentHttpsAgent = new HttpsAgent({
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 60000,
    freeSocketTimeout: 30000,
  });

  // Inject into HttpModule in NestJS
  HttpModule.register({
    httpAgent: persistentHttpAgent,
    httpsAgent: persistentHttpsAgent,
  });
  ```
  Result: Sockets are reused for consecutive requests, dropping latency from 80ms to 2ms per call and eliminating `TIME_WAIT` port exhaustion.

---

### Q48: Refactoring a Monolithic "God Service" using the Strangler Fig Pattern
- **Context/Scenario:** You inherit an `OrderService.ts` file spanning 3,800 lines of code. It handles order validation, database mutations, customer email notifications, invoice generation, discount code calculation, inventory allocation, and telemetry logging. Any small edit frequently introduces regressions in unrelated workflows.
- **What to Look For (Evaluation Criteria):**
  - Applies the **Strangler Fig Pattern** to incrementally carve out responsibilities without a risky, full "Big Bang" rewrite.
  - Deconstructs the God Service into focused domain services (`OrderPricingService`, `OrderValidationService`, `OrderNotificationService`) coordinated via domain events or lightweight orchestrators.
- **Detailed Answer / Explanation:**
  Attempting a full rewrite of a 3,800-line mission-critical service inevitably introduces hidden logic regressions. The **Strangler Fig Pattern** replaces functionality piece by piece.

  **Refactoring Roadmap:**
  1. **Step 1: Write Golden Master (Snapshot) Integration Tests:** Before touching any code, write comprehensive integration tests covering input/output behaviors of all 3,800 lines.
  2. **Step 2: Carve Out Pure Domain Logic First (e.g., Pricing & Discounts):**
     Extract tax and discount calculations into a pure, stateless `OrderPricingCalculator`:
     ```typescript
     export class OrderPricingCalculator {
       static calculateTotal(items: OrderItem[], discount: DiscountPolicy): PricingBreakdown {
         // Pure logic: 100% unit-testable without database mocks
       }
     }
     ```
  3. **Step 3: Extract Side-Effects via Domain Events:**
     Replace direct calls to email and PDF generators with asynchronous domain events:
     ```typescript
     // Instead of: await this.emailService.sendInvoice(order);
     this.eventEmitter.emit('order.created', new OrderCreatedEvent(order));
     ```
  4. **Step 4: Delegate to Focused Sub-Services:**
     Transform `OrderService` into a thin facade orchestrator that delegates to `OrderValidator`, `OrderFulfillmentCoordinator`, and `OrderRepository`.

---

### Q49: Resolving Clock Skew and Timestamp Synchronization in Distributed Order Events
- **Context/Scenario:** In a multi-region deployment (US-East and EU-West), orders and status updates are timestamped using local server system time (`new Date()`). In several instances, an `OrderShipped` event was recorded with a timestamp earlier than the `OrderCreated` event, corrupting customer analytics and breaking event-sourcing projection streams.
- **What to Look For (Evaluation Criteria):**
  - Explains the physical reality of Clock Drift / Skew across distributed servers and why server wall-clock timestamps (`Date.now()`) cannot be relied upon for distributed causal ordering.
  - Implements **Lamport Timestamps**, **Vector Clocks**, or monotonic sequence numbers (`sequence_id` or database auto-increment) to establish causal event ordering.
- **Detailed Answer / Explanation:**
  NTP (Network Time Protocol) synchronization can drift by dozens or hundreds of milliseconds across cloud instances, meaning physical timestamps cannot establish strict causality.

  **Solutions:**
  1. **Monotonic Sequence Numbers (Causal Ordering):**
     Do not sort distributed events by `timestamp`. Instead, use a monotonically increasing sequence counter per aggregate root:
     ```typescript
     export interface DomainEvent {
       aggregateId: string;
       aggregateVersion: number; // 1, 2, 3...
       timestamp: number; // Recorded for human reference, not for ordering logic
     }
     ```
     When projecting state, apply events strictly according to `aggregateVersion`:
     - Version 1: `OrderCreated`
     - Version 2: `OrderPaymentCaptured`
     - Version 3: `OrderShipped`
  2. **PostgreSQL Single Source of Truth:**
     When writing to the database, use PostgreSQL's `CLOCK_TIMESTAMP()` or monotonic database sequence IDs (`BIGINT GENERATED ALWAYS AS IDENTITY`) rather than client-generated Node.js timestamps.

---

### Q50: Disaster Recovery, Point-in-Time Recovery (PITR), and Data Reconciliation
- **Context/Scenario:** At 2:15 PM, a developer accidentally executed an unconstrained `UPDATE orders SET status = 'CANCELLED';` against production PostgreSQL. The last full database backup occurred at 12:00 AM midnight (14 hours ago). You must restore the database to 2:14 PM without losing any of the 45,000 orders placed between midnight and 2:14 PM.
- **What to Look For (Evaluation Criteria):**
  - Details **Point-in-Time Recovery (PITR)** using PostgreSQL Write-Ahead Logs (WAL) archiving (WAL-G, pgBackRest, or AWS RDS automated snapshots).
  - Outlines post-recovery data reconciliation: replaying uncommitted events from message brokers (Kafka/RabbitMQ) and reconciling payment gateway logs to ensure zero lost transactions.
- **Detailed Answer / Explanation:**
  Relying solely on nightly database dumps results in up to 24 hours of data loss (RPO = 24 hours), which is catastrophic for an e-commerce platform.

  **Recovery Strategy:**
  1. **Point-in-Time Recovery (PITR) Execution:**
     - Take the running production database offline immediately to stop further corruption.
     - Restore the midnight base backup onto a fresh database instance.
     - Configure PostgreSQL WAL replay targeting the specific recovery target timestamp:
       ```ini
       # postgresql.conf / recovery.signal
       restore_command = 'wal-g wal-fetch %f %p'
       recovery_target_time = '2026-10-04 14:14:59 UTC'
       recovery_target_action = 'promote'
       ```
     - PostgreSQL replays all Write-Ahead Log segments up to 2:14:59 PM, restoring the exact database state 1 second before the rogue SQL statement was executed.
  2. **Reconciliation & Bridging the Gap:**
     - Query external payment providers (Stripe/PayPal API) for charges captured between 2:14 PM and recovery completion.
     - Reset Kafka consumer group offsets to 2:14 PM on an isolated reconciliation worker to re-consume and re-hydrate any incoming events that were in-flight during the recovery window.
     - Run a checksum comparison script between the restored order database and external logistics/payment systems to confirm 100% data consistency.
