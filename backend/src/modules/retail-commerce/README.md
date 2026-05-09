# Retail Commerce ERP Modules

This directory is the migration-safe home for the core Retail Commerce ERP backend.
The existing analytics modules remain in `src/modules/*` and continue to serve the current dashboard.

Core bounded contexts:

- `brands`: brand master data
- `categories`: category hierarchy
- `products`: product catalog, pricing inputs, GST attributes
- `stores`: store master data
- `inventory`: store-wise stock and reorder levels
- `customers`: customer profiles and GST billing metadata
- `transactions`: transaction items, invoices, payments, and stock deduction

Business logic stays in services, Prisma access stays in repositories, and controllers remain thin.
Forecasting, recommendations, procurement, and warehouse operations are intentionally out of scope for this core foundation.
