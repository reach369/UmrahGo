# 🚀 تعليمات النشر - UmrahGo Frontend

## 📋 **خطوات النشر إلى GitHub Repository جديد**

### 1. **إنشاء Repository جديد على GitHub**

1. اذهب إلى [GitHub.com](https://github.com) وسجل الدخول
2. انقر على **"New repository"** أو الزر **"+"**
3. أدخل المعلومات التالية:
   - **Repository name:** `umrahgo-frontend`
   - **Description:** `🕋 UmrahGo Frontend - Complete Responsive Umrah Management System`
   - **Visibility:** Public أو Private (حسب رغبتك)
   - **لا تضع علامة على:** "Add a README file" (لأن لدينا ملفات بالفعل)
   - **لا تضع علامة على:** "Add .gitignore" (لأن لدينا .gitignore بالفعل)
4. انقر على **"Create repository"**

### 2. **ربط المشروع المحلي بـ GitHub**

```bash
# استبدل YOUR_USERNAME باسم المستخدم الخاص بك على GitHub
git remote add origin https://github.com/YOUR_USERNAME/umrahgo-frontend.git

# التحقق من الـ remote
git remote -v

# رفع المشروع إلى GitHub
git push -u origin master
```

### 3. **إعداد متغيرات البيئة**

قم بإنشاء ملف `.env.local` وأضف المتغيرات التالية:

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

### 4. **تثبيت التبعيات وتشغيل المشروع**

```bash
# تثبيت التبعيات
npm install

# تشغيل خادم التطوير
npm run dev

# فتح المتصفح على
# http://localhost:3000
```

### 5. **النشر على Vercel (موصى به)**

#### **أ) النشر التلقائي:**
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل الدخول باستخدام GitHub
3. انقر على **"New Project"**
4. اختر repository الخاص بك
5. أضف متغيرات البيئة في إعدادات Vercel
6. انقر على **"Deploy"**

#### **ب) النشر باستخدام CLI:**
```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# نشر المشروع
vercel --prod
```

### 6. **النشر على Netlify**

#### **أ) النشر التلقائي:**
1. اذهب إلى [netlify.com](https://netlify.com)
2. سجل الدخول باستخدام GitHub
3. انقر على **"New site from Git"**
4. اختر repository الخاص بك
5. أضف متغيرات البيئة في إعدادات Netlify
6. انقر على **"Deploy site"**

#### **ب) إعدادات البناء:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 7. **النشر باستخدام Docker**

```bash
# بناء صورة Docker
docker build -t umrahgo-frontend .

# تشغيل الحاوية
docker run -p 3000:3000 umrahgo-frontend

# أو باستخدام docker-compose
docker-compose up -d
```

### 8. **إعداد CI/CD مع GitHub Actions**

قم بإنشاء ملف `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build project
      run: npm run build
      env:
        NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
        # أضف باقي متغيرات البيئة
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🔧 **إعدادات إضافية**

### **أ) إعداد Firebase:**
1. إنشاء مشروع Firebase جديد
2. تفعيل Authentication
3. إعداد Firestore Database
4. إعداد Storage
5. إعداد Cloud Messaging

### **ب) إعداد Google Maps:**
1. إنشاء مشروع في Google Cloud Console
2. تفعيل Maps JavaScript API
3. إنشاء API Key
4. إضافة قيود الأمان

### **ج) إعداد Pusher:**
1. إنشاء حساب في Pusher
2. إنشاء تطبيق جديد
3. الحصول على مفاتيح API

## 📊 **مراقبة الأداء**

### **أدوات المراقبة:**
- **Vercel Analytics** - لمراقبة الأداء
- **Google Analytics** - لتتبع المستخدمين
- **Sentry** - لتتبع الأخطاء
- **Lighthouse CI** - لمراقبة جودة الكود

### **إعداد Lighthouse CI:**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Audit URLs using Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.json'
```

## 🔒 **الأمان**

### **نصائح الأمان:**
1. **لا تضع المفاتيح السرية في الكود**
2. **استخدم متغيرات البيئة دائماً**
3. **فعل HTTPS في الإنتاج**
4. **استخدم CSP Headers**
5. **فعل Rate Limiting**

### **إعداد Security Headers:**
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

## 🎯 **نصائح للنجاح**

1. **اختبر المشروع محلياً قبل النشر**
2. **تأكد من جميع متغيرات البيئة**
3. **راجع الـ .gitignore للتأكد من عدم رفع ملفات حساسة**
4. **استخدم فروع Git للتطوير**
5. **اكتب تعليقات واضحة في الـ commits**
6. **راقب الأداء بعد النشر**
7. **احتفظ بنسخ احتياطية من قاعدة البيانات**

---

**🎉 مبروك! مشروع UmrahGo Frontend جاهز للنشر والاستخدام!**
