# Phase 08 — Authentication & Authorization

## Objective

Build secure identity and access control.

## End-to-End Work

Implement:

- Registration
- Login
- Password hashing
- Access tokens
- Refresh tokens
- Logout/revocation strategy
- Password change
- Account status checks
- Roles
- Permissions
- RBAC
- Ownership checks
- Admin/staff/customer boundaries

## Security

Protect against:

- Unauthorized access
- Privilege escalation
- Cross-user resource access
- Mass assignment
- Weak password handling
- Token misuse
- Missing account-status enforcement

## Tests

Prove:

- Unauthenticated requests fail.
- Authenticated customer can access permitted resources.
- Customer cannot access another customer's resources.
- Staff receives only assigned permissions.
- Admin-only actions are protected.
- Expired/revoked tokens fail.
- Invalid input is rejected.

## Exit Criteria

Every protected resource has an explicit authorization rule.

## Evidence

`docs/reports/02-design/security.md`
Unit/integration/E2E security tests.
