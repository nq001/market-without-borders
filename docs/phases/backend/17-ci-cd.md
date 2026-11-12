# Phase 17 — CI/CD

## Objective

Automate quality gates and repeatable delivery.

## Pipeline

At minimum:

1. Install dependencies
2. Lint
3. Type-check
4. Unit tests
5. Integration/E2E tests
6. Security checks
7. Build
8. Build container image
9. Push/version artifact where applicable
10. Deploy according to environment strategy

## Quality Gates

A release must not proceed when required checks fail.

## End-to-End Work

Document:

- Branch strategy
- Environment strategy
- Secrets handling
- Database migration strategy
- Rollback strategy
- Deployment approvals if needed
- Artifact/version strategy

## Exit Criteria

A commit can move through the defined pipeline predictably, and failed quality gates stop unsafe releases.

## Evidence

CI configuration + `docs/reports/04-operations/ci-cd.md`
