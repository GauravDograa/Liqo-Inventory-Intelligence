# Liqo Cortex

Liqo Cortex is a full-stack retail intelligence platform for inventory visibility, deadstock control, store performance analysis, and AI-assisted operational action. It gives retail teams a single command center for understanding where stock is moving, where it is blocked, and which store-to-store transfers should happen next.

The system combines a Next.js dashboard, an Express.js and Prisma API, PostgreSQL-backed retail data models, Redis/BullMQ jobs, object storage for imports, and agentic AI workflows for user queries and caller follow-ups.

## Live Demo

- Frontend: https://liqo-inventory-intelligence-iyub.vercel.app/
- Backend: https://liqo-inventory-intelligence.onrender.com
- Repository: https://github.com/GauravDograa/Liqo-Inventory-Intelligence

## Demo Preview

![Liqo Cortex command center](frontend/public/readme/liqo-cortex-dashboard.png)

## Demo Screenshots

### Secure Demo Access

![Liqo Cortex login](frontend/public/readme/liqo-cortex-login.png)

### Command Center

![Liqo Cortex dashboard](frontend/public/readme/liqo-cortex-dashboard.png)

### Redistribution Intelligence

![Liqo Cortex recommendations](frontend/public/readme/liqo-cortex-recommendations.png)

## What Liqo Cortex Does

- Centralizes inventory health, deadstock exposure, revenue movement, store performance, and stock availability.
- Generates redistribution recommendations using velocity imbalance, stock coverage, and demand signals.
- Provides forecasting-ready analytics for future demand planning and operational decisions.
- Supports role-aware workflows for owners, admins, store managers, warehouse managers, cashiers, and analysts.
- Includes a natural-language AI chatbot for inventory, margin, deadstock, and transfer queries.
- Includes a caller agent concept for automated operational outreach and follow-up workflows.
- Supports CSV imports, invoice PDF generation, audit trails, background jobs, and production health checks.

## Key Features

### Retail Command Center

- KPI cards for revenue, inventory health, deadstock risk, and transfer impact.
- Store performance views for sales velocity, turnover, and margin signals.
- Inventory dashboards with category, SKU, stock, aging, and reorder indicators.
- Decision-lab style simulation views for comparing baseline and transfer outcomes.

### Recommendation Engine

- Detects surplus and low-velocity stock across stores.
- Identifies destination stores with stronger demand and lower stock coverage.
- Produces transfer recommendations with source, destination, quantity, and operational reasoning.
- Uses configurable coverage policies and forecasting-ready demand features.

### Agentic AI Layer

- Chatbot agent answers natural-language user queries over operational data and insights.
- Caller agent supports automated outreach/follow-up workflows for retail operations.
- OpenAI-powered insight routes include fallback behavior when AI credentials are unavailable.
- Rate limiting and input controls are included for safer AI usage.

### Enterprise Backend

- JWT authentication, role-based access control, secure cookies, CORS, Helmet, and request logging.
- Prisma ORM with PostgreSQL models for catalog, inventory, transactions, invoices, recommendations, stores, and audit data.
- Redis/BullMQ job infrastructure for asynchronous processing.
- Object storage support for import files and document workflows.
- Prometheus-compatible metrics and health/readiness endpoints.

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- TanStack React Query
- Axios
- Recharts
- Lucide React
- Zustand
- XLSX export support

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis and BullMQ
- OpenAI API
- AWS S3-compatible object storage
- JWT authentication
- Helmet, CORS, compression, and rate limiting
- Prometheus metrics

### Deployment and Infrastructure

- Docker Compose
- Vercel frontend deployment
- Render backend deployment
- PostgreSQL
- Redis
- MinIO for local S3-compatible object storage
- Background worker process

## Project Structure

```text
Liqo Cortex
|-- backend
|   |-- prisma
|   |   `-- schema.prisma
|   `-- src
|       |-- infrastructure
|       |   |-- database
|       |   |-- events
|       |   |-- logger
|       |   |-- object-storage
|       |   `-- redis
|       |-- middleware
|       |-- modules
|       |   |-- audit
|       |   |-- auth
|       |   |-- dashboard
|       |   |-- import
|       |   |-- insights
|       |   |-- invoices
|       |   |-- jobs
|       |   |-- recommendation
|       |   |-- retail-commerce
|       |   |-- simulation
|       |   |-- stores
|       |   `-- transactions
|       |-- routes
|       |-- server.ts
|       `-- worker.ts
|-- frontend
|   |-- public
|   |   `-- readme
|   |       |-- liqo-cortex-dashboard.png
|   |       |-- liqo-cortex-login.png
|   |       `-- liqo-cortex-recommendations.png
|   `-- src
|       `-- app
|           |-- dashboard
|           |-- deadstock
|           |-- decision-lab
|           |-- import
|           |-- insights
|           |-- inventory
|           |-- invoices
|           |-- login
|           |-- pos
|           |-- recommendations
|           |-- store-operations
|           |-- store-performance
|           `-- warehouse-transfers
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

Protected route groups include:

```text
GET  /dashboard
GET  /inventory
GET  /deadstock
GET  /recommendations
GET  /simulation
GET  /insights
GET  /stores
GET  /store-performance
GET  /transactions
GET  /velocity
GET  /category
GET  /ml-forecast
POST /import
GET  /invoices/:id/pdf
```

Monitoring endpoints:

```text
GET /health
GET /ready
GET /metrics
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Docker and Docker Compose
- PostgreSQL, Redis, and S3-compatible storage if running without Docker

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
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9001

## Manual Setup

### Backend

```bash
cd backend
npm install
copy .env.example .env
npx prisma generate --schema prisma/schema.prisma
npm run dev
```

Important backend environment variables:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/liqo
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
CORS_ORIGINS=http://localhost:3000
ENABLE_DEMO_AUTH=true
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=
OBJECT_STORAGE_BUCKET=liqo-imports
OBJECT_STORAGE_ENDPOINT=http://localhost:9000
OBJECT_STORAGE_ACCESS_KEY_ID=liqo
OBJECT_STORAGE_SECRET_ACCESS_KEY=liqo_dev_object_storage
```

### Worker

```bash
cd backend
npm run start:worker
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend environment:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v2
N8N_ANALYTICS_CHAT_WEBHOOK_URL=
```

## Quality Checks

Backend:

```bash
cd backend
npm run build
npm test
```

Frontend:

```bash
cd frontend
npm run build
npm run lint
```

## Production Notes

- Set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend `/api/v2` URL before building the frontend.
- Configure `CORS_ORIGINS` with the deployed frontend domain.
- Use a strong `JWT_SECRET` and disable demo auth for real deployments.
- Configure Redis for background jobs and rate-limit storage.
- Configure object storage for import and generated-document workflows.
- Keep `/health`, `/ready`, and `/metrics` available for uptime and monitoring systems.

## Author

Gaurav Dogra

- GitHub: https://github.com/GauravDograa
- LinkedIn: https://linkedin.com/in/gauravv-dograa

## Copyright

Copyright (c) 2026 Gaurav Dogra.

All rights reserved. This project and its source code are the intellectual property of Gaurav Dogra. Unauthorized copying, modification, distribution, or use of this software, by any medium, is strictly prohibited without prior permission from the author.
