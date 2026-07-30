FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
# Generate Prisma client before building (required so .prisma/client/ exists at runtime)
RUN pnpm exec prisma generate
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copiar arquivos estáticos públicos
COPY --from=builder /app/public ./public

# Criar pasta de uploads para persistência de arquivos (imagens, áudios, vídeos)
RUN mkdir -p ./uploads

# Volume persistente para uploads de mídia (mapear no Coolify / Docker Compose)
VOLUME ["/app/uploads"]

# Configurar diretório .next
RUN mkdir -p .next

# Automatically leverage output traces to reduce image size
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "server.js"]
