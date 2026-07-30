FROM node:22-alpine AS base

# 1. Instalar dependências necessárias
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# 2. Compilar o projeto
FROM base AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1

# Compilar Next.js no formato standalone
RUN pnpm build

# 3. Runner de Produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copiar arquivos estáticos públicos
COPY --from=builder /app/public ./public

# Criar pasta de uploads para mídia (imagens, áudios, vídeos)
RUN mkdir -p ./uploads

# Volume persistente para uploads de mídia (mapear no Coolify / Docker Compose)
VOLUME ["/app/uploads"]

# Configurar diretório .next
RUN mkdir -p .next

# Copiar o build standalone otimizado
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# O Next.js standalone gera o arquivo server.js para inicialização direta no Node
CMD ["node", "server.js"]
