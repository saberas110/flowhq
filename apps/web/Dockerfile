# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app


RUN npm install -g pnpm


COPY . .




RUN pnpm install



RUN pnpm build


# ---------- Runner ----------
FROM node:20-alpine AS runner

WORKDIR /app


RUN npm install -g pnpm


COPY --from=builder /app ./


ENV NODE_ENV=production

EXPOSE 6500

CMD ["pnpm", "dev"]
