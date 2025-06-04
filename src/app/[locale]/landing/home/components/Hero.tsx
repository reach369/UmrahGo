'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'ar';

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <motion.div
            className="flex-1 text-center lg:text-right"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary">
              {t('home.hero.title') || 'رحلة العمرة سهلة وميسرة مع عمرة جو'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('home.hero.subtitle') || 'منصة متكاملة تساعدك على حجز رحلة العمرة بكل سهولة ويسر مع أفضل مكاتب العمرة المعتمدة'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href={`/${locale}/packages`}>
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 py-6 rounded-full text-lg">
                  {t('home.hero.browsePackages') || 'تصفح باقات العمرة'}
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={`/${locale}/landing/umrah-offices`}>
                <Button variant="outline" className="border-primary/30 hover:bg-primary/5 px-8 py-6 rounded-full text-lg">
                  {t('home.hero.findOffices') || 'البحث عن مكاتب العمرة'}
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative h-[400px] md:h-[500px] w-full">
              <Image
                src="/images/kaaba.png"
                alt="Kaaba"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 hidden lg:block">
        <div className="h-64 w-64 rounded-full bg-primary/5 backdrop-blur-sm"></div>
      </div>
      <div className="absolute bottom-10 right-10 hidden lg:block">
        <div className="h-40 w-40 rounded-full bg-primary/10 backdrop-blur-sm"></div>
      </div>
    </section>
  );
} 