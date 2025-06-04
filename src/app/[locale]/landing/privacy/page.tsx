'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
              {t('privacy.title') || 'سياسة الخصوصية'}
            </h1>
            <p className="text-muted-foreground">
              {t('privacy.lastUpdated') || 'آخر تحديث: 1 يونيو 2023'}
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
              <h2>{t('privacy.introduction.title') || 'مقدمة'}</h2>
              <p>
                {t('privacy.introduction.content') || 'في UmrahGo، نحن نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك عند استخدام موقعنا وخدماتنا.'}
              </p>
              
              <h2>{t('privacy.collectedInfo.title') || 'المعلومات التي نجمعها'}</h2>
              <p>
                {t('privacy.collectedInfo.content') || 'نحن نجمع معلومات شخصية مثل الاسم والعنوان ورقم الهاتف والبريد الإلكتروني عند التسجيل أو الحجز. كما نجمع معلومات عن جهازك مثل عنوان IP ونوع المتصفح وصفحات الويب التي تزورها على موقعنا.'}
              </p>
              
              <h2>{t('privacy.dataUsage.title') || 'كيفية استخدام البيانات'}</h2>
              <p>
                {t('privacy.dataUsage.content') || 'نستخدم معلوماتك الشخصية لتوفير وتحسين خدماتنا، وإتمام عمليات الحجز، والتواصل معك، وإرسال معلومات مهمة تتعلق بحجزك. قد نستخدم معلوماتك أيضًا لإرسال نشرات إخبارية وعروض ترويجية إذا وافقت على ذلك.'}
              </p>
              
              <h2>{t('privacy.dataSecurity.title') || 'أمان البيانات'}</h2>
              <p>
                {t('privacy.dataSecurity.content') || 'نحن نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو التدمير. نحن نستخدم تقنيات تشفير وبروتوكولات آمنة لحماية بياناتك.'}
              </p>
              
              <h2>{t('privacy.cookies.title') || 'ملفات تعريف الارتباط'}</h2>
              <p>
                {t('privacy.cookies.content') || 'نحن نستخدم ملفات تعريف الارتباط (الكوكيز) لتحسين تجربتك على موقعنا. يمكنك ضبط متصفحك لرفض جميع ملفات تعريف الارتباط أو للإشارة عندما يتم إرسال ملف تعريف ارتباط. ومع ذلك، قد لا تعمل بعض ميزات موقعنا بشكل صحيح إذا تم تعطيل ملفات تعريف الارتباط.'}
              </p>
              
              <h2>{t('privacy.thirdParties.title') || 'مشاركة البيانات مع أطراف ثالثة'}</h2>
              <p>
                {t('privacy.thirdParties.content') || 'قد نشارك معلوماتك الشخصية مع مكاتب العمرة لإتمام حجزك. نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة لأغراض تسويقية دون موافقتك الصريحة.'}
              </p>
              
              <h2>{t('privacy.userRights.title') || 'حقوقك'}</h2>
              <p>
                {t('privacy.userRights.content') || 'لديك الحق في الوصول إلى معلوماتك الشخصية وتصحيحها وحذفها. يمكنك أيضًا الاعتراض على معالجة معلوماتك الشخصية وطلب قيود على المعالجة. لممارسة هذه الحقوق، يرجى الاتصال بنا على البريد الإلكتروني المذكور أدناه.'}
              </p>
              
              <h2>{t('privacy.changes.title') || 'التغييرات في سياسة الخصوصية'}</h2>
              <p>
                {t('privacy.changes.content') || 'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة، وإذا كانت التغييرات جوهرية، فسنقدم إشعارًا أكثر وضوحًا.'}
              </p>
              
              <h2>{t('privacy.contact.title') || 'الاتصال بنا'}</h2>
              <p>
                {t('privacy.contact.content') || 'إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا على البريد الإلكتروني: privacy@umrahgo.com أو من خلال نموذج الاتصال على موقعنا.'}
              </p>
            </div>
            
            <div className="mt-8 text-center">
              <Link href={`/${locale}/landing/contact`}>
                <Button variant="outline" className="rounded-full border-primary/30 hover:bg-primary/5">
                  {t('privacy.contactUs') || 'تواصل معنا للاستفسارات'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 