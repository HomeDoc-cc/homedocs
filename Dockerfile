FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl vips-dev build-base python3 postgresql-client
WORKDIR /app

# Cache dependencies based on package-lock.json
COPY package.json package-lock.json ./
RUN npm ci --only=production
RUN cp -R node_modules prod_modules
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client at build time
RUN npx prisma generate

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs && \
  apk add --no-cache vips-dev postgresql-client

# Copy only production dependencies
COPY --from=deps /app/prod_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public

# Set up directories and permissions in one layer
RUN mkdir .next backups && \
  chown nextjs:nodejs .next backups && \
  chmod +x ./scripts/start.sh && \
  chown -R nextjs:nodejs ./scripts && \
  chmod +x /usr/bin/pg_dump && \
  chown nextjs:nodejs /usr/bin/pg_dump

# Copy standalone build and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Generate Prisma Client for production
RUN npx prisma generate

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["./scripts/start.sh"] 
