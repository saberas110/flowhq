# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy ONLY the web app files (because context = apps/web)
COPY package.json  ./

# Install deps & build
RUN pnpm install

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
