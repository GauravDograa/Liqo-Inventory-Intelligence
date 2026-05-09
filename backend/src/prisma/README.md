# Prisma Access

Use `src/infrastructure/database` for application-level Prisma access.
The canonical schema remains at `backend/prisma/schema.prisma` so existing migrations and generated clients keep working.

Future ERP schema changes should be added incrementally and grouped by bounded context comments in the root schema.
