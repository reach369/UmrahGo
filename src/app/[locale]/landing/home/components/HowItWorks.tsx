'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import LoadingFallback from '@/components/ui/loading-fallback';
import ApiErrorBoundary from '@/components/ui/api-error-boundary';

// Services and Types
import { landingService, HowItWorksStep } from '@/services/landing.service';

export default function HowItWorks() {
    const t = useTranslations();
  const locale = useLocale();
  const [steps, setSteps] = useState<HowItWorksStep[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch how it works steps
  useEffect(() => {
    const fetchSteps = async () => {
      try {
        setLoading(true);
        const data = await landingService.getHowItWorksSteps();
        setSteps(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching how it works steps:', error);
        setLoading(false);
        
        // Fallback steps if API fails
        setSteps([
          {
            id: 1,
            title: 'اختر مكتب العمرة',
            description: 'تصفح مكاتب العمرة المعتمدة واختر المكتب المناسب لك',
            icon: 'building',
            order: 1
          },
          {
            id: 2,
            title: 'اختر الباقة المناسبة',
            description: 'اختر من بين مجموعة متنوعة من باقات العمرة',
            icon: 'package',
            order: 2
          },
          {
            id: 3,
            title: 'أكمل الحجز',
            description: 'أدخل بياناتك وقم بإتمام عملية الحجز بكل سهولة',
            icon: 'check',
            order: 3
          },
          {
            id: 4,
            title: 'استمتع برحلتك',
            description: 'استمتع برحلة روحانية لا تُنسى مع أفضل الخدمات',
            icon: 'heart',
            order: 4
          }
        ]);
      }
    };

    fetchSteps();
  }, []);

  // Get icon component by name
  const getStepIcon = (iconName: string) => {
    // Return number in circle based on step order
    return (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white text-xl font-bold">
        {steps.findIndex(step => step.icon === iconName) + 1}
      </div>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <ApiErrorBoundary errorMessage="فشل في تحميل خطوات العمل">
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4 text-primary"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {t('home.howItWorks.title') || 'كيف تعمل منصة عمرة جو؟'}
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {t('home.howItWorks.subtitle') || 'خطوات بسيطة للحصول على أفضل تجربة عمرة'}
            </motion.p>
          </div>

          {loading ? (
            <LoadingFallback type="features" count={4} />
          ) : steps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                لا توجد خطوات متاحة في الوقت الحالي
              </p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {steps.sort((a, b) => a.order - b.order).map((step) => (
                <motion.div 
                  key={step.id}
                  className="flex flex-col items-center text-center p-6 rounded-xl border border-primary/10 bg-card hover:shadow-md transition-shadow duration-300"
                  variants={itemVariants}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-6">
                    {getStepIcon(step.icon)}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-primary">{typeof step.title === 'object' ? step.title[locale as keyof typeof step.title] : step.title}</h3>
                  <p className="text-muted-foreground">{typeof step.description === 'object' ? step.description[locale as keyof typeof step.description] : step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </ApiErrorBoundary>
  );
} 