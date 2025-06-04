'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  
  return (
    <div className="min-h-screen py-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl font-bold mb-4 text-primary">
              {t('terms.title') || 'الشروط والأحكام'}
            </h1>
            <p className="text-muted-foreground">
              {t('terms.lastUpdated') || 'آخر تحديث: 1 يونيو 2023'}
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-card p-8 rounded-xl shadow-sm border border-primary/10">
            <Link 
              href={`/${locale}/landing/home`}
              className="inline-flex items-center text-primary hover:text-primary/80 mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.backToHome') || 'العودة للرئيسية'}
            </Link>
            
            <div className="prose prose-lg max-w-none">
              <h2>{t('terms.introduction.title') || 'مقدمة'}</h2>
              <p>
                {t('terms.introduction.content') || 'مرحبًا بك في موقع UmrahGo. تنطبق هذه الشروط والأحكام على استخدامك لموقعنا الإلكتروني وخدماتنا. من خلال الوصول إلى موقعنا أو استخدامه، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق على أي جزء من هذه الشروط، فيرجى عدم استخدام موقعنا.'}
              </p>
              
              <h2>{t('terms.services.title') || 'الخدمات'}</h2>
              <p>
                {t('terms.services.content') || 'يوفر UmrahGo منصة لحجز باقات العمرة من مكاتب متعددة. نحن نعمل كوسيط بين المعتمرين ومكاتب العمرة المعتمدة. نحن لا نقدم خدمات العمرة بشكل مباشر ولا نتحمل مسؤولية أي مشكلات قد تنشأ بين المستخدم ومكتب العمرة.'}
              </p>
              
              <h2>{t('terms.account.title') || 'حسابك'}</h2>
              <p>
                {t('terms.account.content') || 'عند إنشاء حساب على موقعنا، فإنك مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. أنت مسؤول عن جميع الأنشطة التي تتم تحت حسابك. يجب عليك إخطارنا فورًا بأي استخدام غير مصرح به لحسابك.'}
              </p>
              
              <h2>{t('terms.booking.title') || 'الحجوزات والمدفوعات'}</h2>
              <p>
                {t('terms.booking.content') || 'عند حجز باقة عمرة، فإنك توافق على دفع جميع الرسوم المحددة لتلك الباقة. قد تطلب بعض الباقات دفعة مقدمة أو دفع كامل المبلغ. يمكن أن تخضع سياسات الإلغاء واسترداد الأموال لشروط مكتب العمرة المختار.'}
              </p>
              
              <h2>{t('terms.liability.title') || 'حدود المسؤولية'}</h2>
              <p>
                {t('terms.liability.content') || 'UmrahGo ليست مسؤولة عن أي أضرار مباشرة أو غير مباشرة أو عرضية ناتجة عن استخدام موقعنا أو خدماتنا. نحن لا نضمن دقة أو اكتمال المعلومات المقدمة على موقعنا.'}
              </p>
              
              <h2>{t('terms.changes.title') || 'التغييرات على الشروط'}</h2>
              <p>
                {t('terms.changes.content') || 'نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة. استمرار استخدامك للموقع بعد نشر التغييرات يعني موافقتك على الشروط المعدلة.'}
              </p>
              
              <h2>{t('terms.contact.title') || 'الاتصال بنا'}</h2>
              <p>
                {t('terms.contact.content') || 'إذا كان لديك أي أسئلة حول هذه الشروط والأحكام، يرجى الاتصال بنا على البريد الإلكتروني: info@umrahgo.com أو من خلال نموذج الاتصال على موقعنا.'}
              </p>
            </div>
            
            <div className="mt-8 text-center">
              <Link href={`/${locale}/landing/contact`}>
                <Button variant="outline" className="rounded-full border-primary/30 hover:bg-primary/5">
                  {t('terms.contactUs') || 'تواصل معنا للاستفسارات'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 