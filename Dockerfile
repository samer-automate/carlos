FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS builder-sqlite
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev
# Rebuild better-sqlite3 for the target platform
RUN npm rebuild better-sqlite3

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/scripts ./scripts

# Copy better-sqlite3 for the migrate script
COPY --from=builder-sqlite /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder-sqlite /app/node_modules/bindings ./node_modules/bindings 2>/dev/null || true
COPY --from=builder-sqlite /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path 2>/dev/null || true

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/data/carlos.db"

CMD ["sh", "-c", "mkdir -p /app/data && node scripts/migrate.js && node server.js"]
