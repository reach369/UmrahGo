# 🕋 UmrahGo Frontend - نظام إدارة العمرة المتكامل

![UmrahGo Logo](public/images/logo.png)

## 🌟 نظرة عامة

**UmrahGo Frontend** هو نظام إدارة العمرة المتكامل والمتطور، مصمم لتوفير تجربة سلسة ومتكاملة لجميع أطراف رحلة العمرة. يوفر النظام منصة شاملة تربط بين الحجاج ومكاتب العمرة ومشغلي الحافلات.

### ✨ المميزات الرئيسية

- 🎨 **تصميم متجاوب بالكامل** - يعمل بشكل مثالي على جميع الأجهزة
- 🌍 **دعم متعدد اللغات** - العربية والإنجليزية مع دعم RTL
- 🔐 **نظام مصادقة متقدم** - Firebase Auth مع Google و Facebook
- 💬 **نظام دردشة مباشر** - تواصل فوري بين جميع الأطراف
- 💰 **نظام محفظة إلكترونية** - إدارة المدفوعات والمعاملات
- 📊 **لوحات تحكم متخصصة** - لكل نوع مستخدم
- 🚌 **إدارة النقل** - تتبع ومراقبة الحافلات
- 📱 **تطبيق ويب تقدمي (PWA)** - تجربة تطبيق أصلي

## 🏗️ التقنيات المستخدمة

### Frontend Framework
- **Next.js 14** - React Framework مع App Router
- **TypeScript** - للتطوير الآمن والموثوق
- **Tailwind CSS** - للتصميم السريع والمتجاوب
- **Framer Motion** - للحركات والانتقالات السلسة

### UI Components
- **Radix UI** - مكونات واجهة المستخدم المتقدمة
- **Lucide React** - أيقونات حديثة وجميلة
- **React Hook Form** - إدارة النماذج المتقدمة
- **Sonner** - إشعارات أنيقة

### State Management
- **Redux Toolkit** - إدارة الحالة العامة
- **Zustand** - إدارة الحالة المحلية
- **React Query** - إدارة البيانات والتخزين المؤقت

### Authentication & Database
- **Firebase Auth** - نظام المصادقة
- **Firestore** - قاعدة البيانات
- **Firebase Storage** - تخزين الملفات

### Maps & Location
- **Google Maps API** - الخرائط والمواقع
- **React Google Maps** - تكامل الخرائط مع React

### Communication
- **Pusher** - الدردشة المباشرة
- **WebSocket** - الاتصال المباشر

## 🚀 البدء السريع

### المتطلبات الأساسية

- Node.js 18+
- npm أو yarn أو pnpm
- Git

### التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/your-username/umrahgo-frontend.git
cd umrahgo-frontend

# تثبيت التبعيات
npm install
# أو
yarn install
# أو
pnpm install
```

### إعداد متغيرات البيئة

```bash
# نسخ ملف البيئة النموذجي
cp .env.example .env.local

# تحرير الملف وإضافة المفاتيح المطلوبة
nano .env.local
```

### متغيرات البيئة المطلوبة

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Configuration
NEXT_PUBLIC_API_URL=https://api.umrahgo.net/api/v1
NEXT_PUBLIC_BASE_URL=https://umrahgo.net

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Pusher (للدردشة المباشرة)
NEXT_PUBLIC_PUSHER_APP_ID=your_pusher_app_id
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_SECRET=your_pusher_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

### تشغيل المشروع

```bash
# تشغيل خادم التطوير
npm run dev
# أو
yarn dev
# أو
pnpm dev

# فتح المتصفح على
http://localhost:3000
```

## 📱 أنواع المستخدمين

### 1. 🕋 الحجاج (Pilgrims)
- تصفح وحجز باقات العمرة
- إدارة الحجوزات والمدفوعات
- تتبع الرحلة والنقل
- الدردشة مع مكاتب العمرة
- إدارة المحفظة الإلكترونية

### 2. 🏢 مكاتب العمرة (Umrah Offices)
- إدارة الباقات والخدمات
- متابعة الحجوزات والعملاء
- نظام إدارة المدفوعات
- تقارير مالية وإحصائية
- التواصل مع الحجاج

### 3. 🚌 مشغلي الحافلات (Bus Operators)
- إدارة أسطول الحافلات
- تتبع الرحلات والمسارات
- إدارة السائقين والمركبات
- تقارير التشغيل والصيانة

## 🎨 نظام التصميم

### الألوان الرئيسية
- **الذهبي**: `#D4AF37` - اللون الأساسي
- **الأخضر**: `#10B981` - اللون الثانوي
- **الأزرق الداكن**: `#1E293B` - النصوص الرئيسية
- **الرمادي**: `#64748B` - النصوص الثانوية

### الخطوط
- **العربية**: Cairo, Tajawal
- **الإنجليزية**: Inter, Roboto

### نقاط الكسر (Breakpoints)
- **xs**: 475px (هواتف كبيرة)
- **sm**: 640px (تابلت صغير)
- **md**: 768px (تابلت)
- **lg**: 1024px (لابتوب)
- **xl**: 1280px (ديسكتوب)
- **2xl**: 1536px (شاشات كبيرة)

## 🔧 البناء والنشر

### بناء المشروع للإنتاج

```bash
# بناء المشروع
npm run build

# تشغيل النسخة المبنية
npm start
```

### النشر على Vercel

```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر المشروع
vercel --prod
```

### النشر باستخدام Docker

```bash
# بناء صورة Docker
docker build -t umrahgo-frontend .

# تشغيل الحاوية
docker run -p 3000:3000 umrahgo-frontend
```

## 📊 الهيكل العام للمشروع

```
umrahgo-frontend/
├── 📁 src/
│   ├── 📁 app/                 # Next.js App Router
│   │   ├── 📁 [locale]/        # صفحات متعددة اللغات
│   │   ├── 📁 api/             # API Routes
│   │   └── 📄 layout.tsx       # التخطيط الرئيسي
│   ├── 📁 components/          # المكونات القابلة لإعادة الاستخدام
│   │   ├── 📁 ui/              # مكونات واجهة المستخدم
│   │   ├── 📁 auth/            # مكونات المصادقة
│   │   ├── 📁 chat/            # مكونات الدردشة
│   │   └── 📁 maps/            # مكونات الخرائط
│   ├── 📁 lib/                 # المكتبات والأدوات
│   ├── 📁 hooks/               # React Hooks مخصصة
│   ├── 📁 services/            # خدمات API
│   ├── 📁 stores/              # إدارة الحالة
│   ├── 📁 types/               # تعريفات TypeScript
│   └── 📁 utils/               # دوال مساعدة
├── 📁 public/                  # الملفات العامة
│   ├── 📁 images/              # الصور
│   ├── 📁 icons/               # الأيقونات
│   └── 📁 sounds/              # الأصوات
├── 📁 messages/                # ملفات الترجمة
├── 📁 docs/                    # الوثائق
└── 📄 README.md               # هذا الملف
```

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm test

# تشغيل اختبارات التغطية
npm run test:coverage

# اختبار التصميم المتجاوب
npm run test:responsive
```

## 📈 الأداء والتحسين

- ✅ **Core Web Vitals** محسنة
- ✅ **تحميل تدريجي** للصور
- ✅ **تقسيم الكود** التلقائي
- ✅ **تخزين مؤقت** ذكي
- ✅ **ضغط الأصول** التلقائي

## 🔒 الأمان

- 🛡️ **HTTPS إجباري**
- 🔐 **مصادقة متعددة العوامل**
- 🚫 **حماية من CSRF**
- 🔒 **تشفير البيانات الحساسة**
- 📋 **تسجيل العمليات الأمنية**

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) قبل البدء.

### خطوات المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 🆘 الدعم والمساعدة

- 📧 **البريد الإلكتروني**: support@umrahgo.net
- 💬 **Discord**: [انضم لخادمنا](https://discord.gg/umrahgo)
- 📱 **الهاتف**: +966 XX XXX XXXX
- 🌐 **الموقع**: [umrahgo.net](https://umrahgo.net)

## 🙏 شكر وتقدير

شكر خاص لجميع المساهمين والمكتبات مفتوحة المصدر المستخدمة في هذا المشروع.

---

**🎯 مشروع UmrahGo Frontend - تجربة عمرة رقمية متكاملة ومتطورة!**