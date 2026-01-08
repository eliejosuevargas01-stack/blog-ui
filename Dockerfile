FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build:full
RUN pnpm prune --prod

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/server/node-build.mjs"]
