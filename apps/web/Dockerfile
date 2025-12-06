# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy ONLY the web app files (because context = apps/web)
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY apps ./apps
COPY packages ./packages


# Install deps & build
RUN pnpm install --no-frozen-lockfile

# Build only the web app (with its workspace deps)
RUN pnpm --filter ./apps/web build


# ---------- Runner ----------
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy built files
COPY --from=builder /app ./

# Set env
ENV NODE_ENV=production





EXPOSE 6500

# Start Next.js
CMD ["pnpm", "start"]
