# Phase 06 — API Contract

## Objective

Define the public API before implementation.

## End-to-End Work

Specify:

- REST resources
- URL conventions
- HTTP methods/status codes
- DTOs
- Validation
- Authentication requirements
- Authorization requirements
- Ownership requirements
- Error format
- Pagination
- Filtering
- Search
- Sorting
- Idempotency headers/semantics where required
- Webhook endpoints
- Health endpoints

## Required API Areas

Auth, users, roles/permissions, products, categories, inventory, cart, coupons, orders, checkout, payments, shipping, notifications, reviews, audit, health.

## Swagger

Create an OpenAPI/Swagger contract that is:

- Complete
- Consistent
- Example-driven
- Usable by frontend/integration consumers

## Exit Criteria

- Every public endpoint has a contract.
- Every protected endpoint has auth/permission rules.
- Error behavior is standardized.
- Critical workflows can be executed from the API contract alone.

## Evidence

`docs/reports/02-design/api.md`
`openapi.*`
