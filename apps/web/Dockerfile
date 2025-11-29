# -----------------------------
# 1) Base image
# -----------------------------
FROM node:20 AS builder

WORKDIR /app

# Copy root workspace info
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy full monorepo
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Install deps for ONLY this project
RUN pnpm install --filter="./apps/web"

# Build the web app
WORKDIR /app/apps/web
RUN pnpm build

# -----------------------------
# 2) Runtime image
# -----------------------------
FROM node:20 AS runner

WORKDIR /app

COPY --from=builder /app/apps/web/.next .next
COPY --from=builder /app/apps/web/public public
COPY --from=builder /app/apps/web/package.json package.json

EXPOSE 6500

CMD ["pnpm", "start"]
