# Liqo Inventory Intelligence Platform

Liqo Inventory Intelligence is a full-stack retail analytics platform for monitoring inventory, detecting deadstock, comparing store performance, and generating data-driven stock redistribution recommendations.

The platform combines a Next.js dashboard with an Express and Prisma API so retail teams can quickly understand where stock is moving, where it is stuck, and what action should be taken next.

## Live Demo

- Frontend: https://liqo-inventory-intelligence-ep1q.vercel.app/login
- Backend: https://liqo-inventory-intelligence.onrender.com

## Preview

![Liqo dashboard](frontend/public/readme/dashboard.png)

## Key Features

- Dashboard analytics for revenue, inventory health, store performance, and operational risk.
- Deadstock detection to identify slow-moving products before they become costly.
- Smart redistribution recommendations for moving stock from surplus stores to high-demand stores.
- Inventory visibility across stores, categories, SKUs, and stock levels.
- Store performance insights based on sales velocity, turnover, and margin signals.
- Import workflows for bringing inventory and business data into the platform.
- Forecasting and ML-ready modules for demand intelligence and future planning.
- Secure cookie-based authentication with protected API routes.
- Health and metrics endpoints for production monitoring.

## Screenshots

### Login

![Login page](frontend/public/readme/login.png)

### Dashboard

![Dashboard](frontend/public/readme/dashboard.png)

### Recommendations

![Recommendations](frontend/public/readme/recommendations.png)

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack React Query
- Axios
- Recharts
- Lucide React
- XLSX export support

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Cookie parser
- Helmet
- CORS
- Compression
- Express rate limiting
- Prometheus metrics

### DevOps and Monitoring

- Docker Compose
- Vercel frontend deployment
- Render backend deployment
- PostgreSQL
- Prometheus
- Grafana
- Uptime monitoring through `/health`

## Project Structure

```text
Liqo Inventory Intelligence Platform
|-- backend
|   |-- prisma
|   |   `-- schema.prisma
|   `-- src
|       |-- middleware
|       |-- modules
|       |   |-- auth
|       |   |-- dashboard
|       |   |-- deadstock
|       |   |-- import
|       |   |-- insights
|       |   |-- inventory
|       |   |-- mlForecast
|       |   |-- recommendation
|       |   |-- simulation
|       |   |-- sku
|       |   |-- store
|       |   |-- storePerformance
|       |   |-- transaction
|       |   `-- velocity
|       |-- observability
|       |-- routes
|       `-- server.ts
|-- frontend
|   |-- public
|   |   `-- readme
|   |       |-- dashboard.png
|   |       |-- login.png
|   |       `-- recommendations.png
|   `-- src
|       `-- app
|           |-- dashboard
|           |-- deadstock
|           |-- decision-lab
|           |-- import
|           |-- insights
|           |-- inventory
|           |-- login
|           |-- recommendations
|           |-- settings
|           `-- store-performance
|-- k8s
|-- observability
|-- docker-compose.yml
`-- README.md
```

## API Overview

Base API path:

```text
/api/v2
```

Public routes:

```text
POST /auth/login
POST /auth/guest
POST /auth/logout
```

Protected route groups:

```text
GET /dashboard
GET /deadstock
GET /insights
GET /inventory
GET /recommendations
GET /simulation
GET /sku
GET /stores
GET /store-performance
GET /transactions
GET /velocity
GET /category
POST /import
GET /ml-forecast
```

Monitoring endpoints:

```text
GET /health
GET /metrics
```

## Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL
- Docker and Docker Compose, optional but recommended

### Clone the Repository

```bash
git clone https://github.com/GauravDograa/Liqo-Inventory-Intelligence.git
cd Liqo-Inventory-Intelligence
```

### Run with Docker Compose

```bash
docker compose up --build
```

Default local services:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432

To include observability services:

```bash
docker compose --profile observability up --build
```

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

## Manual Setup

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/liqo"
JWT_SECRET="replace-with-a-secure-secret"
PORT=5000
DEFAULT_ORGANIZATION_ID="default-org-001"
DEMAND_SIGNAL_PROVIDER="historical_velocity"
ML_FORECAST_MODEL_NAME="liqo-demand-forecast-v1"
OPENAI_API_KEY=""
ML_FORECAST_API_URL=""
```

Generate Prisma artifacts and run the backend:

```bash
npm run prisma:generate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v2
N8N_ANALYTICS_CHAT_WEBHOOK_URL=
```

Run the frontend:

```bash
npm run dev
```

## Quality Checks

From the repository root:

```bash
npm run ci
```

Frontend only:

```bash
npm --prefix frontend run ci
```

Backend only:

```bash
npm --prefix backend run ci
```

## Production Notes

- The frontend expects `NEXT_PUBLIC_API_BASE_URL` to point to the deployed backend `/api/v2` URL.
- The backend enables CORS for local development and the deployed Vercel frontend.
- Protected API routes require a valid authentication cookie.
- `/health` is intended for uptime checks.
- `/metrics` exposes Prometheus-compatible metrics.

## Author

Gaurav Dogra

- GitHub: https://github.com/GauravDograa

## Copyright

Copyright (c) 2026 Gaurav Dogra.

All rights reserved. This project and its source code are the intellectual property of Gaurav Dogra. Unauthorized copying, modification, distribution, or use of this software, by any medium, is strictly prohibited without prior permission from the author.
