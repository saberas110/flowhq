FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/api
RUN pnpm build

FROM node:20-alpine AS runner

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

RUN pnpm install --prod --frozen-lockfile

WORKDIR /app/apps/api

ENV NODE_ENV=production

EXPOSE 4500

CMD ["node", "dist/main"]

