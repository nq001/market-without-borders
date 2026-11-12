# ADR 005: Inventory Concurrency & Locking

## Status
Accepted

## Context
When multiple users attempt to purchase the same limited-stock item simultaneously, the system must prevent overselling (negative inventory) without sacrificing overall checkout throughput. 

## Decision
We will use **Atomic Conditional Updates** combined with a PostgreSQL `CHECK (available_quantity >= 0)` constraint rather than pessimistic row locking (e.g., `SELECT ... FOR UPDATE`).

Example update:
```sql
UPDATE inventories 
SET available_quantity = available_quantity - :qty 
WHERE product_id = :id AND available_quantity >= :qty;
```
If the affected rows count is 0, the application throws a domain exception (Out of Stock), and the checkout transaction is rolled back.

## Consequences
### Positive
- Extremely high throughput compared to pessimistic locking.
- Prevents database deadlocks during high-traffic flash sales.
- The database physically enforces the `>= 0` invariant, removing the risk of application-level race conditions.

### Negative
- Requires raw SQL execution or highly specific TypeORM QueryBuilder syntax, bypassing standard entity `save()` methods for inventory mutation.
