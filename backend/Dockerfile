FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY src ./src
COPY tsconfig.json ./

RUN npm run build && npm prune --omit=dev

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 5000

CMD ["npm", "run", "start"]
