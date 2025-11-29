# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm


COPY ../../pnpm-workspace.yaml ../../pnpm-lock.yaml ../../package.json ./
RUN pnpm install --frozen-lockfile

# Copy ONLY the web app files (because context = apps/web)
COPY . .

RUN pnpm build


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
