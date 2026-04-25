# Liqo DevOps Lifecycle

This branch establishes the DevOps foundation for Liqo Inventory Intelligence. The goal is to make delivery repeatable, reviewable, and safe without blocking day-to-day feature work.

## Lifecycle Mapping

### 1. Plan

- Track work in clearly scoped issues or tickets.
- Use `main` as the production branch.
- Use short-lived feature branches for product work.
- Use `liqo/devops` to evolve CI/CD, deployment, and operational tooling before merging to `main`.

### 2. Code

- Frontend lives in `frontend/`.
- Backend lives in `backend/`.
- Open a pull request for every branch before merging to `main`.
- Keep environment secrets out of git and use the example env files as the contract.

### 3. Build

- Backend build: `npm --prefix backend run build`
- Frontend build: `npm --prefix frontend run build`
- Full repo CI entrypoint: `npm run ci`

### 4. Test

- Frontend quality gate: `npm --prefix frontend run lint`
- Backend smoke test: `npm --prefix backend run test:smoke`
- Backend CI command: `npm --prefix backend run ci`
- Frontend CI command: `npm --prefix frontend run ci`

The current backend test baseline is a deployment-oriented smoke test that verifies the built server starts and serves `/health`. This is enough to guard the first DevOps loop, and it should be extended with unit and integration tests as feature work continues.

### 5. Release

- Merge only after CI passes.
- Prefer squash merges for clean release history.
- Tag releases from `main` when you want a durable deployment marker.
- Record the release date, commit SHA, and any required env changes in the PR description.

### 6. Deploy

- Frontend target: Vercel
- Backend target: Render
- Backend blueprint: `render.yaml`
- Frontend config: `frontend/vercel.json`

### 7. Operate

- Prisma migrations live in `backend/prisma/migrations`.
- The backend process exposes `/health` for uptime and deployment checks.
- Deployment changes should include rollback notes in the PR when infra or env vars are touched.

### 8. Monitor

- Uptime target starts with `/health`.
- Prometheus-compatible metrics are exposed at `/metrics`.
- Expand next with structured logging, error tracking, and business KPI alerting.
- Treat frontend build failures, backend smoke test failures, and health endpoint failures as deployment blockers.

## 7 Cs Status

- Continuous Development: enabled through branch + PR workflow.
- Continuous Integration: enabled through GitHub Actions.
- Continuous Testing: baseline enabled with lint + smoke test.
- Continuous Deployment/Delivery: partially enabled through staging workflow, image publishing, and documented Render/Vercel flow.
- Continuous Monitoring: baseline enabled through `/health`, `/metrics`, and the local Prometheus/Grafana scaffold.
- Continuous Feedback: enabled through PR review plus CI signal.
- Continuous Operations: documented baseline in place, still needs stronger alerting and runbooks over time.

## Local Commands

```bash
npm run ci
npm --prefix backend run ci
npm --prefix frontend run ci
```

## Next Improvements

- Add secret management for staging and production outside plain repo config.
- Add backend unit tests for recommendation, simulation, and import logic.
- Add frontend tests for critical views and hooks.
- Add branch protection in GitHub so CI is required before merge.
- Add production error tracking and alert routing.
- Add release tagging workflow and release notes automation.
- Add centralized cluster logs and tracing for staging/production.
- Add real autoscaling and production capacity tuning.
