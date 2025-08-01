'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Icons
import { FileText, ArrowLeft, Scale, Shield, Users, CreditCard } from 'lucide-react';

export default function TermsPage() {
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
          <span className="text-foreground">{t('footer.termsOfService') || 'شروط الخدمة'}</span>
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
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            {t('terms.title') || 'شروط الخدمة'}
            </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('terms.subtitle') || 'يرجى قراءة شروط الخدمة بعناية قبل استخدام منصة UmrahGo'}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            آخر تحديث: {new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
            </p>
          </motion.div>
      </section>
      
      {/* Terms Content */}
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
                  <Scale className="h-5 w-5 mr-2 text-primary" />
                  {t('terms.introduction.title') || 'مقدمة'}
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  مرحباً بك في منصة UmrahGo. هذه الشروط والأحكام تحكم استخدامك لموقعنا الإلكتروني والخدمات المقدمة من خلاله. 
                  باستخدام منصتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* User Responsibilities */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  {t('terms.userResponsibilities.title') || 'مسؤوليات المستخدم'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">معلومات صحيحة</h4>
                    <p className="text-muted-foreground">
                      يجب عليك تقديم معلومات صحيحة ودقيقة عند التسجيل أو حجز أي خدمة من خلال المنصة.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">الاستخدام المسؤول</h4>
                    <p className="text-muted-foreground">
                      يجب استخدام المنصة بطريقة مسؤولة وعدم إساءة استخدامها أو استخدامها لأغراض غير قانونية.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">حماية الحساب</h4>
                    <p className="text-muted-foreground">
                      أنت مسؤول عن حماية بيانات حسابك وكلمة المرور الخاصة بك.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Service Terms */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  {t('terms.serviceTerms.title') || 'شروط الخدمة'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">طبيعة الخدمة</h4>
                    <p className="text-muted-foreground">
                      UmrahGo هي منصة وسيطة تربط بين المعتمرين ومكاتب العمرة المعتمدة. نحن لا نقدم خدمات العمرة بشكل مباشر.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">مسؤولية مكاتب العمرة</h4>
                    <p className="text-muted-foreground">
                      مكاتب العمرة المدرجة في المنصة مسؤولة عن تقديم الخدمات المتفق عليها وفقاً للمعايير المحددة.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">التحقق من المكاتب</h4>
                    <p className="text-muted-foreground">
                      نحرص على التحقق من مكاتب العمرة المدرجة في المنصة، لكن المسؤولية النهائية تقع على المستخدم في اختيار المكتب المناسب.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Payment Terms */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-primary" />
                  {t('terms.paymentTerms.title') || 'شروط الدفع'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">طرق الدفع</h4>
                    <p className="text-muted-foreground">
                      نقبل طرق الدفع المختلفة المتاحة في المنصة. جميع المعاملات المالية محمية بأعلى معايير الأمان.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">سياسة الاسترداد</h4>
                    <p className="text-muted-foreground">
                      سياسة الاسترداد تختلف حسب مكتب العمرة وطبيعة الخدمة المحجوزة. يرجى مراجعة شروط كل مكتب قبل الحجز.
              </p>
            </div>
            
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">الرسوم الإضافية</h4>
                    <p className="text-muted-foreground">
                      قد تطبق رسوم إضافية على بعض الخدمات. سيتم إشعارك بأي رسوم إضافية قبل إتمام الحجز.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Limitation of Liability */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('terms.liability.title') || 'حدود المسؤولية'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 text-sm">
                    <strong>إخلاء مسؤولية:</strong> UmrahGo غير مسؤولة عن أي أضرار مباشرة أو غير مباشرة قد تنتج عن استخدام المنصة أو الخدمات المقدمة من خلالها. 
                    مسؤوليتنا محدودة بقيمة الخدمة المحجوزة.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Contact Information */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('terms.contact.title') || 'معلومات الاتصال'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  إذا كان لديك أي استفسارات حول شروط الخدمة، يرجى التواصل معنا:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>البريد الإلكتروني:</strong> legal@umrahgo.com</p>
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