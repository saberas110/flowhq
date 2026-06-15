# ==========================================
# مرحله ۱: Pruner (جداکننده کدهای مورد نیاز)
# ==========================================
FROM node:20-alpine AS pruner
RUN npm install -g turbo
WORKDIR /app

# کپی کردن فایل‌های مدیریت پکیج از روت پروژه
COPY . .

# استفاده از دستور جادویی turbo برای استخراج فقط کدهای مربوط به اپلیکیشن web
# این دستور یک پوشه به نام 'out' می‌سازد که فقط شامل کدهای web و وابستگی‌هایش است
RUN turbo prune web --docker

# ==========================================
# مرحله ۲: Builder (محیط ساخت و نصب پکیج‌ها)
# ==========================================
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# کپی کردن فایل‌های استخراج شده از مرحله pruner (فقط چیزهایی که لازم است)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/full/ .


RUN pnpm config set registry https://registry.npmjs.ir/
# RUN pnpm config set registry https://registry.npmmirror.com/

# ۲. مقاوم کردن pnpm در برابر قطعی‌های لحظه‌ای اینترنت
RUN pnpm config set fetch-retries 5
RUN pnpm config set fetch-retry-mintimeout 20000
RUN pnpm config set fetch-retry-maxtimeout 120000
RUN pnpm config set network-timeout 1000000
# نصب پکیج‌ها
RUN pnpm install --frozen-lockfile


RUN pnpm build --filter=web

# ==========================================
# مرحله ۳: Runner (محیط اجرا - بسیار سبک و امن)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# نصب pnpm برای اجرای دستور start
RUN npm install -g pnpm

# کپی کردن فقط فایل‌های نهایی برای اجرا (بدون سورس‌کدها و پکیج‌های سنگین توسعه)
# ما فقط از پوشه ساخت شده در مرحله قبل استفاده می‌کنیم
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

# ورود به پوشه اپلیکیشن برای اجرای دستور
WORKDIR /app/apps/web

EXPOSE 6500

# اجرای سرور پروداکشن
CMD ["pnpm", "ی"]