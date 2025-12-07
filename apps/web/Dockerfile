# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app


RUN npm install -g pnpm



COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY packages ./packages
COPY apps/web ./apps/web




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
