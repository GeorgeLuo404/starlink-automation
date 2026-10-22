# 深圳市星链自动化有限公司 · 生产镜像
# Shenzhen Starlink Automation — production image
#
#   docker build -t starlink-web .
#   docker compose -f docker-compose.prod.yml up -d
#
# 使用 Next.js standalone 输出，最终镜像只包含被追踪到的运行时依赖。
# Uses Next.js standalone output so the final image only ships traced runtime deps.

FROM node:24-alpine AS base
RUN corepack enable && apk add --no-cache libc6-compat tini
WORKDIR /app

# ---------------------------------------------------------------- deps ------
FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# ------------------------------------------------------------- builder ------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1 \
    BUILD_STANDALONE=true \
    NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma generate only needs the URL shape, never a live connection.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" pnpm exec prisma generate \
 && DATABASE_URL="postgresql://build:build@localhost:5432/build" pnpm exec next build

# ------------------------------------------------------------ migrator ------
# Runs `prisma migrate deploy`. Kept separate so the runtime image stays small.
FROM base AS migrator
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml prisma.config.ts ./
COPY prisma ./prisma
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]

# ------------------------------------------------------------- runner -------
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    STORAGE_DRIVER=local \
    STORAGE_LOCAL_DIR=/app/storage/uploads

RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001 \
 && mkdir -p /app/storage/uploads /app/public \
 && chown -R nextjs:nodejs /app/storage /app/public

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
