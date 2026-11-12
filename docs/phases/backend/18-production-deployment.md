# Phase 18 — Production Deployment

## Objective

Run Qubrax in a real production environment.

## Production Components

- API
- PostgreSQL
- Redis
- Reverse proxy/load balancer where appropriate
- TLS
- Secrets
- Backups
- Persistent storage
- DNS/domain
- Environment configuration

## Deployment Work

1. Provision infrastructure.
2. Configure secrets securely.
3. Deploy database.
4. Configure backups.
5. Deploy Redis.
6. Deploy API.
7. Run migrations safely.
8. Configure TLS.
9. Configure health/readiness checks.
10. Verify Swagger/API.
11. Verify logs.
12. Verify rollback.
13. Verify backup and restore procedure.

## Exit Criteria

Qubrax is reachable through a production URL and the complete customer journey works against production infrastructure.

## Evidence

`docs/reports/04-operations/deployment.md`
`docs/reports/04-operations/disaster-recovery.md`
Production URL
Deployment records
Backup/restore evidence
