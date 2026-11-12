# Phase 16 — Docker & Local Production Parity

## Objective

Make Qubrax reproducible and close to production behavior locally.

## End-to-End Work

Create:

- Production-oriented Dockerfile
- Docker Compose
- API container
- PostgreSQL
- Redis
- Persistent volumes
- Environment configuration
- Health checks
- Test environment
- Migration startup strategy
- Seed strategy

## Verify

From a clean environment:

1. Start infrastructure.
2. Run migrations.
3. Start API.
4. Run health/readiness checks.
5. Run automated tests.
6. Exercise complete checkout flow.

## Exit Criteria

Another engineer can clone the repository and run Qubrax without undocumented machine-specific setup.

## Evidence

`Dockerfile`
`docker-compose.yml`
`docs/reports/04-operations/docker.md`
