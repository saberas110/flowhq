# Use an official Node.js runtime as the base image for building
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy root package files and workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy shared packages
COPY packages ./packages

# Copy web app
COPY apps/web ./apps/web

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the web app
WORKDIR /app/apps/web
RUN pnpm build

# Use a minimal Node.js runtime for the production image
FROM node:20-alpine AS runner

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root package files
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

# Copy shared packages
COPY --from=builder /app/packages ./packages

# Copy web app
COPY --from=builder /app/apps/web ./apps/web

RUN pnpm install --frozen-lockfile

# Set working directory to web app
WORKDIR /app/apps/web

# Set the environment variable to production
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 6500

# Start the Next.js application
CMD ["pnpm", "start"]
