'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Icons
import { Shield, ArrowLeft, Eye, Lock, Database, UserCheck, Cookie } from 'lucide-react';

export default function PrivacyPage() {
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const t = useTranslations();
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="min-h-screen py-20">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 mb-8">
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
          <Link href={`/${locale}`} className="hover:text-primary">
            {t('nav.home') || 'الرئيسية'}
          </Link>
          <span>/</span>
          <span className="text-foreground">{t('footer.privacyPolicy') || 'سياسة الخصوصية'}</span>
        </nav>
      </div>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              {t('privacy.title') || 'سياسة الخصوصية'}
            </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('privacy.subtitle') || 'نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية'}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            آخر تحديث: {new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
            </p>
          </motion.div>
      </section>
      
      {/* Privacy Content */}
      <section className="container mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Introduction */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-primary" />
                  {t('privacy.introduction.title') || 'مقدمة'}
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  في UmrahGo، نحن ملتزمون بحماية خصوصيتك وأمان معلوماتك الشخصية. هذه السياسة توضح كيفية جمع واستخدام وحماية 
                  بياناتك الشخصية عند استخدام منصتنا.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Data Collection */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-primary" />
                  {t('privacy.dataCollection.title') || 'جمع البيانات'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">البيانات الشخصية</h4>
                    <p className="text-muted-foreground">
                      نجمع البيانات التي تقدمها لنا مثل الاسم، البريد الإلكتروني، رقم الهاتف، وتفاصيل الهوية اللازمة لحجز خدمات العمرة.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">بيانات الاستخدام</h4>
                    <p className="text-muted-foreground">
                      نجمع معلومات حول كيفية استخدامك للمنصة، مثل الصفحات التي تزورها والخدمات التي تتصفحها.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">البيانات التقنية</h4>
                    <p className="text-muted-foreground">
                      نجمع معلومات تقنية مثل عنوان IP، نوع المتصفح، ونظام التشغيل لتحسين أداء المنصة.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Data Usage */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-primary" />
                  {t('privacy.dataUsage.title') || 'استخدام البيانات'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">تقديم الخدمات</h4>
                    <p className="text-muted-foreground">
                      نستخدم بياناتك لتقديم خدمات الحجز والتواصل معك بخصوص حجوزاتك.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">تحسين الخدمة</h4>
                    <p className="text-muted-foreground">
                      نحلل بيانات الاستخدام لتحسين منصتنا وتطوير خدمات جديدة.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">التواصل</h4>
                    <p className="text-muted-foreground">
                      نستخدم معلومات الاتصال لإرسال تحديثات مهمة حول حجوزاتك وخدماتنا.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Data Protection */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-primary" />
                  {t('privacy.dataProtection.title') || 'حماية البيانات'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">التشفير</h4>
                    <p className="text-muted-foreground">
                      جميع البيانات الحساسة مشفرة باستخدام أحدث تقنيات التشفير.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">الوصول المحدود</h4>
                    <p className="text-muted-foreground">
                      فقط الموظفون المخولون يمكنهم الوصول إلى بياناتك الشخصية.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">المراقبة المستمرة</h4>
                    <p className="text-muted-foreground">
                      نراقب أنظمتنا باستمرار للكشف عن أي محاولات اختراق أو وصول غير مصرح به.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Cookies */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cookie className="h-5 w-5 mr-2 text-primary" />
                  {t('privacy.cookies.title') || 'ملفات تعريف الارتباط'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">ملفات تعريف الارتباط الضرورية</h4>
                    <p className="text-muted-foreground">
                      نستخدم ملفات تعريف الارتباط الضرورية لتشغيل المنصة بشكل صحيح.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">ملفات تعريف الارتباط التحليلية</h4>
                    <p className="text-muted-foreground">
                      نستخدم ملفات تعريف الارتباط لفهم كيفية استخدامك للمنصة وتحسين تجربتك.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">التحكم في ملفات تعريف الارتباط</h4>
                    <p className="text-muted-foreground">
                      يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* User Rights */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('privacy.userRights.title') || 'حقوق المستخدم'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">الوصول للبيانات</h4>
                    <p className="text-sm text-muted-foreground">
                      يحق لك طلب نسخة من بياناتك الشخصية المحفوظة لدينا.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">تصحيح البيانات</h4>
                    <p className="text-sm text-muted-foreground">
                      يمكنك طلب تصحيح أي معلومات غير صحيحة.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">حذف البيانات</h4>
                    <p className="text-sm text-muted-foreground">
                      يمكنك طلب حذف بياناتك الشخصية في ظروف معينة.
              </p>
            </div>
            
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">نقل البيانات</h4>
                    <p className="text-sm text-muted-foreground">
                      يمكنك طلب نقل بياناتك إلى خدمة أخرى.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Contact Information */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('privacy.contact.title') || 'معلومات الاتصال'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  إذا كان لديك أي استفسارات حول سياسة الخصوصية أو ترغب في ممارسة حقوقك، يرجى التواصل معنا:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>مسؤول حماية البيانات:</strong> privacy@umrahgo.com</p>
                  <p><strong>الهاتف:</strong> +966 50 000 0000</p>
                  <p><strong>العنوان:</strong> شارع الملك فهد، الرياض، المملكة العربية السعودية</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href={`/${locale}`}>
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.backToHome') || 'العودة للرئيسية'}
                </Button>
              </Link>
        </div>
      </section>
    </div>
  );
} 