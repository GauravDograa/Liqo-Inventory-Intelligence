# Kubernetes Prep

This folder is a starter scaffold for moving Liqo Inventory Intelligence from Docker Compose to Kubernetes later.

## Structure

- `base/namespace.yaml`: shared namespace
- `base/kustomization.yaml`: base kustomize entrypoint
- `base/backend-deployment.yaml`: backend deployment + service
- `base/frontend-deployment.yaml`: frontend deployment + service
- `base/ingress.yaml`: placeholder ingress routing
- `overlays/staging/`: staging overlay wired to GHCR image names
- `overlays/production/`: production overlay wired to GHCR image names

## Assumptions

- frontend and backend images will eventually be pushed to a registry such as GHCR, ECR, or Docker Hub
- PostgreSQL should be managed separately in production rather than deployed in-cluster for this app's first production version
- secrets like `DATABASE_URL` and `JWT_SECRET` should come from Kubernetes Secrets or an external secret manager

## Next Step

When you are ready for Kubernetes or EKS:

1. Push Docker images to a registry
2. Create Kubernetes Secrets for backend environment variables
3. Add an ingress controller and TLS
4. Set the real staging and production hostnames in the overlays
5. Add readiness/liveness probes, resource requests, and autoscaling

## Staging Overlay

The staging overlay now assumes these image names:

- `ghcr.io/gauravdograa/liqo-backend`
- `ghcr.io/gauravdograa/liqo-frontend`

Before a real cluster deploy, update:

- `liqo-staging.example.com` in `overlays/staging/ingress-patch.yaml`
- `NEXT_PUBLIC_API_BASE_URL` in `overlays/staging/frontend-patch.yaml`
- the `liqo-backend-secrets` secret in the cluster

## Metrics Wiring

The staging backend overlay now includes Prometheus scrape annotations for `/metrics` on port `5000`.

That means a Prometheus deployment that respects standard scrape annotations can discover backend metrics without requiring a Prometheus Operator or `ServiceMonitor` CRD on day one.

## GitHub Actions Deployment

The repository now includes `.github/workflows/deploy-staging.yml`.

To use it, add this repository secret:

- `KUBE_CONFIG_DATA`: base64-encoded kubeconfig for the staging cluster

Then trigger the workflow manually or let it run on `main` changes to the Kubernetes folder.

## Production Overlay

The repository now also includes a production overlay plus a manual production deployment workflow.

Before using production deploys, update:

- `liqo.example.com` in `overlays/production/ingress-patch.yaml`
- `NEXT_PUBLIC_API_BASE_URL` in `overlays/production/frontend-patch.yaml`
- `KUBE_CONFIG_DATA_PRODUCTION` as a GitHub secret
- the `liqo-backend-secrets` secret in the production cluster
