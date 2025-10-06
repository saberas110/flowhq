FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/cms ./apps/cms

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/cms
RUN pnpm build

FROM node:20-alpine AS runner

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/cms ./apps/cms

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/cms

ENV NODE_ENV=production

EXPOSE 7000

CMD ["pnpm", "start"]
