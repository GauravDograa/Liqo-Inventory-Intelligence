# Containers And Local Platform

This repository now supports a local containerized stack for frontend, backend, and PostgreSQL.

## What Exists

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`
- `k8s/` scaffold for future Kubernetes or EKS work
- `.github/workflows/containers.yml` for Docker validation and image publishing

## Local Docker Compose

Start the stack:

```bash
docker compose up --build
```

Start the stack with Prometheus and Grafana:

```bash
docker compose --profile observability up --build
```

Stop the stack:

```bash
docker compose down
```

Stop and remove database volume:

```bash
docker compose down -v
```

## Local URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Backend health: `http://localhost:5000/health`
- Backend metrics: `http://localhost:5000/metrics`
- PostgreSQL: `localhost:5432`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

## Compose Services

- `postgres`: PostgreSQL 16 with a named Docker volume
- `backend`: Node/Express API container
- `frontend`: Next.js production container
- `prometheus`: scrapes backend metrics when the `observability` profile is enabled
- `grafana`: dashboard layer for Prometheus when the `observability` profile is enabled

## Notes

- The frontend container talks to the backend container internally using `http://backend:5000/api/v2`.
- Browser traffic from your machine still uses `localhost`.
- The backend container uses the Compose PostgreSQL service by default.
- `OPENAI_API_KEY` and `ML_FORECAST_API_URL` are left blank in Compose and can be filled in later if needed.
- Grafana defaults to `admin` / `admin` in local Compose and should be changed outside local development.

## Container CI/CD

- Pull requests validate both Dockerfiles by building backend and frontend images in GitHub Actions.
- Pushes to `main` publish images to GitHub Container Registry (`ghcr.io`).
- Published image names are designed to map cleanly into the Kubernetes manifests later.
- A separate staging workflow can apply the Kubernetes staging overlay once cluster credentials are configured.

Expected image names:

- `ghcr.io/<owner>/liqo-backend`
- `ghcr.io/<owner>/liqo-frontend`

## Staging Deploy Workflow

The repo now includes `.github/workflows/deploy-staging.yml`.

It expects:

- a Kubernetes cluster reachable through a `KUBE_CONFIG_DATA` GitHub secret
- GHCR images already published from `main`
- the `k8s/overlays/staging` values updated with your real staging hostname and API URL

## Production Deploy Workflow

The repo now includes `.github/workflows/deploy-production.yml`.

It expects:

- a production Kubernetes cluster reachable through `KUBE_CONFIG_DATA_PRODUCTION`
- manual workflow dispatch
- the `k8s/overlays/production` values updated with your real production hostname and API URL

## Local Dashboards

When you run the observability profile, Grafana now auto-provisions:

- a Prometheus datasource
- a starter `Liqo Backend Overview` dashboard
- Prometheus alert rules for high error rate and high P95 latency

## Kubernetes Prep

The `k8s/base` folder is intentionally a starter scaffold, not a finished production cluster setup.

Use it as the next step after:

1. Building stable Docker images
2. Publishing images to a registry
3. Deciding how production secrets and PostgreSQL will be managed
