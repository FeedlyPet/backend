FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/src/migrations ./src/migrations
COPY --from=builder /app/src/data-source.ts ./src/data-source.ts
COPY --from=builder /app/src/common ./src/common
COPY --from=builder /app/tsconfig.json ./tsconfig.json

COPY wait-for-db.js ./wait-for-db.js

EXPOSE 3000

ENV NODE_ENV=production

CMD ["sh", "-c", "node wait-for-db.js && npm run migration:run && node dist/main"]