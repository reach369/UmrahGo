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
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
          <motion.div
            className="flex-1 text-center lg:text-right"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-primary leading-tight">
              {t('home.hero.title') || 'رحلة العمرة سهلة وميسرة مع عمرة جو'}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
              {t('home.hero.subtitle') || 'منصة متكاملة تساعدك على حجز رحلة العمرة بكل سهولة ويسر مع أفضل مكاتب العمرة المعتمدة'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link href={`/${locale}/landing/packages`}>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-6 py-3 sm:px-8 sm:py-4 lg:py-6 rounded-full text-sm sm:text-base lg:text-lg font-medium">
                  {t('home.hero.browsePackages') || 'تصفح باقات العمرة'}
                  <ArrowRight className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href={`/${locale}/landing/umrah-offices`}>
                <Button variant="outline" className="w-full sm:w-auto border-primary/30 hover:bg-primary/5 px-6 py-3 sm:px-8 sm:py-4 lg:py-6 rounded-full text-sm sm:text-base lg:text-lg font-medium">
                  {t('home.hero.findOffices') || 'البحث عن مكاتب العمرة'}
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Background decorative circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px] lg:w-[450px] lg:h-[450px] rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-3xl"></div>
            </div>

            {/* Main image container */}
            <div className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] w-full flex items-center justify-center">
              <div className="relative w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px]">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 blur-2xl animate-pulse"></div>
                
                {/* Kaaba image */}
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
              <Image
                src="/images/kaaba.png"
                    alt="الكعبة المشرفة"
                fill
                    sizes="(max-width: 640px) 200px, (max-width: 768px) 250px, (max-width: 1024px) 300px, 400px"
                    className="object-cover scale-110 hover:scale-125 transition-transform duration-700 ease-out"
                priority
              />
                </div>
                
                {/* Floating particles - responsive */}
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8 lg:top-10 lg:right-10 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary/40 rounded-full animate-bounce delay-100"></div>
                <div className="absolute bottom-12 left-4 sm:bottom-16 sm:left-6 lg:bottom-20 lg:left-8 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary/30 rounded-full animate-bounce delay-300"></div>
                <div className="absolute top-1/3 left-6 sm:left-8 lg:left-12 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-primary/50 rounded-full animate-bounce delay-500"></div>
                <div className="absolute bottom-1/3 right-8 sm:right-12 lg:right-16 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary/35 rounded-full animate-bounce delay-700"></div>
              </div>
            </div>
            
            {/* Additional decorative elements - responsive */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:top-8 lg:left-8 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border border-primary/20 rounded-full animate-spin-slow"></div>
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 border border-primary/15 rounded-full animate-spin-slow-reverse"></div>
          </motion.div>
        </div>
      </div>
      
      {/* Enhanced decorative elements */}
      <div className="absolute top-20 left-10 hidden lg:block">
        <div className="h-64 w-64 rounded-full bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm animate-pulse"></div>
      </div>
      <div className="absolute bottom-10 right-10 hidden lg:block">
        <div className="h-40 w-40 rounded-full bg-gradient-to-tl from-primary/10 to-primary/5 backdrop-blur-sm animate-pulse delay-1000"></div>
      </div>
      
      {/* Additional floating elements */}
      <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-primary/20 rounded-full animate-float hidden lg:block"></div>
      <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-primary/15 rounded-full animate-float delay-2000 hidden lg:block"></div>
    </section>
  );
} 