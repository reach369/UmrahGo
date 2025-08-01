# استخدام Node.js 20 كصورة أساسية
FROM node:20-alpine AS base

# تثبيت libc6-compat والأدوات المساعدة
RUN apk add --no-cache libc6-compat curl tini

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci --only=production && npm cache clean --force

# مرحلة البناء
FROM base AS builder

WORKDIR /app

# تمرير متغيرات البناء (إذا كانت موجودة)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# نسخ ملفات package مرة أخرى
COPY package*.json ./

# تثبيت جميع التبعيات (بما في ذلك devDependencies)
RUN npm ci

# نسخ الكود المصدري
COPY . .

# إنشاء متغيرات البيئة للبناء
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# بناء التطبيق
RUN npm run build

# مرحلة الإنتاج
FROM base AS runner

WORKDIR /app

# إنشاء مستخدم غير جذر
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# نسخ الملفات العامة
COPY --from=builder /app/public ./public

# نسخ ملفات البناء
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# إنشاء ملف health check
RUN echo '#!/bin/sh\ncurl -f http://localhost:3000/api/health || exit 1' > /app/health.sh && \
    chmod +x /app/health.sh

# تعيين المستخدم
USER nextjs

# كشف المنفذ
EXPOSE 3000

# تعيين متغيرات البيئة
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# إضافة health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 CMD [ "/app/health.sh" ]

# استخدام tini كinit process
ENTRYPOINT ["/sbin/tini", "--"]

# تشغيل التطبيق
CMD ["node", "server.js"]
