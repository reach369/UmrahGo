'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';

// Icons
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'ar';

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t('home.cta.title') || 'جاهز لبدء رحلة العمرة الخاصة بك؟'}
          </motion.h2>
          <motion.p 
            className="text-xl text-white/80 mb-10"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('home.cta.subtitle') || 'اختر من بين أفضل مكاتب العمرة المعتمدة وباقات العمرة المميزة واحجز رحلتك الآن'}
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href={`/${locale}/packages`}>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-lg font-medium"
              >
                {t('home.cta.browsePackages') || 'تصفح باقات العمرة'}
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href={`/${locale}/landing/umrah-offices`}>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg font-medium"
              >
                {t('home.cta.findOffices') || 'البحث عن مكاتب العمرة'}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320"
          className="w-full h-auto text-background"
          preserveAspectRatio="none"
        >
          <path 
            fill="currentColor" 
            fillOpacity="1" 
            d="M0,224L60,229.3C120,235,240,245,360,234.7C480,224,600,192,720,181.3C840,171,960,181,1080,197.3C1200,213,1320,235,1380,245.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
} 