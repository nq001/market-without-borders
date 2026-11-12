# ADR 006: Authentication & Role-Based Access Control

## Status
Accepted

## Context
The platform requires secure authentication for Customers, Staff, and Admins. Staff require highly granular permissions (e.g., `orders.read`, `inventory.update`) rather than blanket administrative access.

## Decision
We will use **JWT (JSON Web Tokens)** for stateless authentication, utilizing short-lived Access Tokens and long-lived, revokable Refresh Tokens persisted in the database.
For Authorization, we will implement **RBAC (Role-Based Access Control)** using custom NestJS Guards. A user is assigned a Role, and a Role has many Permissions. 

## Consequences
### Positive
- Stateless access tokens scale well and do not require a database lookup on every request.
- Fine-grained permissions allow safe delegation of tasks to staff without compromising security.

### Negative
- Revoking an access token before it expires is difficult; we rely on short expiration times (e.g., 15 minutes) and revoking the refresh token.
- NestJS Guards must be carefully applied to ensure resource ownership (e.g., checking if the `order.customer_id` matches the token payload) in addition to global RBAC permissions.
