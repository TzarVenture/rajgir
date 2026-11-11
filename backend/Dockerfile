FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# 1. Install dependencies
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

# 2. Build the NestJS app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client if schema exists
RUN npx prisma generate --schema=./prisma/schema.prisma || true

RUN npm run build

# 3. Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

USER nestjs

EXPOSE 4000

CMD ["node", "dist/main"]

