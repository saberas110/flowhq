# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app







COPY . .


RUN ls -la .




RUN ls -la /


RUN npm install -g pnpm

RUN ls R



#COPY pnpm-workspace.yaml ./

#COPY package.json ./
##COPY packages ./packages
##COPY apps ./apps

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
