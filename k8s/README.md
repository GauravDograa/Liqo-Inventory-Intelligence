# Kubernetes Prep

This folder is a starter scaffold for moving Liqo Inventory Intelligence from Docker Compose to Kubernetes later.

## Structure

- `base/namespace.yaml`: shared namespace
- `base/backend-deployment.yaml`: backend deployment + service
- `base/frontend-deployment.yaml`: frontend deployment + service
- `base/ingress.yaml`: placeholder ingress routing

## Assumptions

- frontend and backend images will eventually be pushed to a registry such as GHCR, ECR, or Docker Hub
- PostgreSQL should be managed separately in production rather than deployed in-cluster for this app's first production version
- secrets like `DATABASE_URL` and `JWT_SECRET` should come from Kubernetes Secrets or an external secret manager

## Next Step

When you are ready for Kubernetes or EKS:

1. Push Docker images to a registry
2. Replace the placeholder image tags in `base/`
3. Create Kubernetes Secrets for backend environment variables
4. Add an ingress controller and TLS
5. Add readiness/liveness probes, resource requests, and autoscaling
