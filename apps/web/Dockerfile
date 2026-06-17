# ==========================================
# مرحله ۱: Pruner (جداکننده کدهای مورد نیاز)
# ==========================================
FROM node:20-alpine AS pruner
RUN npm install -g turbo
WORKDIR /app

COPY . .
RUN turbo prune web --docker

# ==========================================
# مرحله ۲: Builder (محیط ساخت و نصب پکیج‌ها)
# ==========================================
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# 🌟 ترفند کش: اینجا "فقط" فایل‌های پکیج (json) رو کپی می‌کنیم
COPY --from=pruner /app/out/json/ .

# تنظیمات اینترنت و تحریم‌شکن
RUN pnpm config set registry https://registry.npmjs.ir/
RUN pnpm config set fetch-retries 5
RUN pnpm config set fetch-retry-mintimeout 20000
RUN pnpm config set fetch-retry-maxtimeout 120000
RUN pnpm config set network-timeout 1000000

# 🌟 نصب پکیج‌ها (چون سورس کد هنوز کپی نشده، این مرحله تا ابد کش میشه مگر اینکه پکیج جدیدی اضافه کنی!)
RUN pnpm install --frozen-lockfile

# 🌟 حالا که نصب تموم شد، کل سورس کد (full) رو کپی می‌کنیم
COPY --from=pruner /app/out/full/ .

# بیلد گرفتن
RUN pnpm build --filter=web

# ==========================================
# مرحله ۳: Runner (محیط اجرا - بسیار سبک و امن)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=6500

# در حالت حرفه‌ای (Standalone) اصلا نیازی به نصب pnpm تو محیط اجرا نیست!

# کپی کردن پوشه scripts (در صورتی که برای ماگریشن یا سوکت نیاز داری)
COPY --from=builder /app/apps/web/scripts ./apps/web/scripts

# کپی کردن پوشه پابلیک
COPY --from=builder /app/apps/web/public ./apps/web/public

# 🌟 کپی کردن نسخه مینیاتوری شده پروژه (حالت Standalone) و فایل‌های استاتیک
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 6500

# اجرای سرور پروداکشن (بدون نیاز به رفتن تو ورک‌دایرکتوری اضافی)
CMD ["node", "apps/web/server.js"]