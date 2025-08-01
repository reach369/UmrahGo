'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Components
import { Button } from '@/components/ui/button';
import { 
  UserIcon, 
  BuildingOffice2Icon, 
} from '@heroicons/react/24/outline';
import { ArrowRight, CheckCircle, Search, CreditCard, CalendarDays, Users } from 'lucide-react';

// Services
import { landingService, HowItWorksStep } from '@/services/landing.service';
import { getFaqs, getUserTypes } from './data';

const DecorativeBlobs = dynamic(() => import('./components/DecorativeBlobs'), { ssr: false });
const ProcessTimeline = dynamic(() => import('./components/ProcessTimeline'), { ssr: false });
const UserTypes = dynamic(() => import('./components/UserTypes'), { ssr: false });

// Helper function to render the correct icon based on string name
const getIconComponent = (iconName: string) => {
  const iconProps = { className: "h-6 w-6 text-primary" };
  switch (iconName?.toLowerCase()) {
    case 'search':
      return <Search {...iconProps} />;
    case 'creditcard':
    case 'payment':
      return <CreditCard {...iconProps} />;
    case 'calendar':
    case 'travel':
      return <CalendarDays {...iconProps} />;
    case 'users':
      return <Users {...iconProps} />;
    default:
      return <CheckCircle {...iconProps} />;
  }
};

export default function HowItWorksPage() {
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const t = useTranslations();
  const isRtl = locale === 'ar';
  
  const faqs = getFaqs(t);
  
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
        staggerChildren: 0.2
      }
    }
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              {t('howItWorks.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('howItWorks.hero.subtitle')}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link href={`/${locale}/landing/packages`}>
                <Button size="lg" className="rounded-full text-lg px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/20">
                  {t('howItWorks.hero.button1')}
                  <span className={`${isRtl ? 'mr-2' : 'ml-2'}`}>
                    <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </span>
                </Button>
              </Link>
              <Link href={`/${locale}/contact`}>
                <Button variant="outline" size="lg" className="rounded-full text-lg px-8 border-primary/30 hover:bg-primary/5">
                  {t('howItWorks.hero.button2')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 hidden lg:block">
          <div className="h-32 w-32 rounded-full bg-primary/10 backdrop-blur-sm"></div>
        </div>
        <div className="absolute bottom-10 right-10 hidden lg:block">
          <div className="h-20 w-20 rounded-full bg-primary/15 backdrop-blur-sm"></div>
        </div>
        <DecorativeBlobs />
      </section>
      
      {/* Process Overview Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              {t('howItWorks.process.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('howItWorks.process.subtitle')}
            </p>
          </motion.div>
          
          <ProcessTimeline />
        </div>
      </section>
      
      <UserTypes />
      
      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              {t('howItWorks.faqs.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('howItWorks.faqs.subtitle')}
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="space-y-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {faqs.map((faq, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <div className="bg-card p-6 rounded-xl shadow-md border-2 border-primary/10 hover:border-primary/20 transition-all duration-300">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 flex-shrink-0">
                        <span className="text-primary font-bold">Q</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-primary">{faq.question}</h3>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              className="text-center mt-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <p className="text-muted-foreground mb-6">
                {t('howItWorks.faqs.more')}
              </p>
              <Link href={`/${locale}/contact`}>
                <Button variant="outline" className="rounded-full border-primary/30 hover:bg-primary/5">
                  {t('howItWorks.faqs.button')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
              {t('howItWorks.cta.title')}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t('howItWorks.cta.description')}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={`/${locale}/landing/packages`}>
                <Button size="lg" className="rounded-full text-lg px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg">
                  {t('howItWorks.cta.button1')}
                  <span className={`${isRtl ? 'mr-2' : 'ml-2'}`}>
                    <ArrowRight className={`h-5 w-5 ${isRtl ? 'rotate-180' : ''}`} />
                  </span>
                </Button>
              </Link>
              <Link href={`/${locale}/landing/about-us`}>
                <Button variant="outline" size="lg" className="rounded-full text-lg px-8 border-primary/30 hover:bg-primary/5">
                  {t('howItWorks.cta.button2')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Elements with fixed positions */}
        <motion.div
          className="absolute rounded-full bg-primary/10 backdrop-blur-sm"
          style={{
            width: '80px',
            height: '80px',
            top: '20%',
            left: '10%',
          }}
          animate={{
            y: [0, -15],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute rounded-full bg-primary/10 backdrop-blur-sm"
          style={{
            width: '120px',
            height: '120px',
            top: '60%',
            left: '85%',
          }}
          animate={{
            y: [0, 20],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute rounded-full bg-primary/10 backdrop-blur-sm"
          style={{
            width: '100px',
            height: '100px',
            top: '40%',
            left: '70%',
          }}
          animate={{
            y: [0, -10],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute rounded-full bg-primary/10 backdrop-blur-sm"
          style={{
            width: '60px',
            height: '60px',
            top: '80%',
            left: '5%',
          }}
          animate={{
            y: [0, 25],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute rounded-full bg-primary/10 backdrop-blur-sm"
          style={{
            width: '140px',
            height: '140px',
            top: '10%',
            left: '90%',
          }}
          animate={{
            y: [0, -20],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </section>
    </div>
  );
} 