'use client';

import { landingService, HowItWorksStep } from '@/services/landing.service';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowRight, CheckCircle, Search, CreditCard, CalendarDays, Users, Mail, Heart, Star } from 'lucide-react';

const getIconComponent = (iconName: string) => {
  const iconProps = { className: "h-6 w-6 text-primary" };
  switch (iconName?.toLowerCase()) {
    case 'search':
      return <Search {...iconProps} />;
    case 'check-circle':
      return <CheckCircle {...iconProps} />;
    case 'credit-card':
    case 'creditcard':
    case 'payment':
      return <CreditCard {...iconProps} />;
    case 'calendar':
    case 'travel':
      return <CalendarDays {...iconProps} />;
    case 'users':
      return <Users {...iconProps} />;
    case 'mail':
      return <Mail {...iconProps} />;
    case 'heart':
      return <Heart {...iconProps} />;
    default:
      return <CheckCircle {...iconProps} />;
  }
};

const ProcessTimeline = () => {
  const t = useTranslations();
  const params = useParams();
  const [steps, setSteps] = useState<HowItWorksStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const locale = params?.locale as string || 'ar';
  const isRtl = locale === 'ar';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stepsData = await landingService.getHowItWorksSteps();
        setSteps(stepsData);
      } catch (error) {
        console.error('Error fetching how it works data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchData();
    }
  }, [mounted]);

  // Helper function to get translated text
  const getTranslatedText = (text: string | undefined | null): string => {
    // Handle undefined, null, or non-string values
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    // Check if it's a translation key (starts with a known prefix)
    if (text.startsWith('howItWorks.') || text.includes('.')) {
      const translated = t(text);
      // If translation returns the key itself, return a fallback
      return translated !== text ? translated : text;
    }
    // If it's already a translated string, return as is
    return text;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: (isEven: boolean) => ({
      opacity: 0,
      x: isEven ? 50 : -50
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  const dotVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    hover: {
      scale: 1.1,
      boxShadow: "0 0 0 8px rgba(212, 175, 55, 0.15)",
      transition: { duration: 0.2 }
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
      {/* Animated timeline line */}
      <motion.div 
        className="absolute left-0 right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-primary/60 to-primary/30 mx-auto hidden md:block rounded-full shadow-lg"
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: '100%',
          opacity: 1,
          transition: { duration: 0.8, ease: "easeInOut" }
        }}
        style={{
          background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.8) 50%, rgba(212, 175, 55, 0.3) 100%)'
        }}
      />
      
      {/* Animated progress line */}
      <motion.div 
        className="absolute left-0 right-0 top-0 w-1 bg-gradient-to-b from-primary to-primary/90 mx-auto hidden md:block rounded-full shadow-lg"
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: activeStep ? `${((activeStep + 1) / 6) * 100}%` : '0%',
          opacity: 1,
          transition: { duration: 0.8, ease: "easeInOut" }
        }}
      />
      
      {loading ? (
        // Loading skeleton
        <div className="space-y-16">
          {[1, 2, 3, 4].map((_, index) => (
            <div 
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
            >
              <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'} mb-8 md:mb-0`}>
                <div className="bg-card p-6 rounded-xl shadow-md animate-pulse h-48">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 mr-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-primary/10 rounded w-32"></div>
                      <div className="h-5 bg-primary/10 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="h-3 bg-primary/5 rounded w-full"></div>
                    <div className="h-3 bg-primary/5 rounded w-5/6"></div>
                    <div className="h-3 bg-primary/5 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
              
              {/* Center Dot */}
              <div className="w-8 h-8 rounded-full bg-primary/10 absolute left-1/2 transform -translate-x-1/2 hidden md:block"></div>
              
              {/* Empty spacer for right side on desktop */}
              <div className="w-full md:w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        // Actual steps
        <motion.div
          className="relative space-y-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px 0px -100px 0px" }}
        >
          <AnimatePresence>
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const isRtlAdjusted = isRtl ? !isEven : isEven;
              
              return (
                <motion.div
                  key={step.id}
                  className={`relative flex flex-col ${isRtlAdjusted ? 'md:flex-row-reverse' : 'md:flex-row'} items-center`}
                  custom={isRtlAdjusted}
                  variants={{
                      hover: { x: isRtlAdjusted ? -5 : 5 }
                    }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px 0px -50px 0px" }}
                  onViewportEnter={() => setActiveStep(index)}
                >
                  {/* Step Content */}
                  <motion.div 
                    className={`w-full md:w-1/2 ${isRtlAdjusted ? 'md:pl-16' : 'md:pr-16'} mb-8 md:mb-0`}
                    whileHover="hover"
                    variants={{
                      hover: { x: isRtlAdjusted ? -5 : 5 }
                    }}
                  >
                    <motion.div 
                      className={`bg-gradient-to-br from-white to-primary/5 dark:from-gray-800 dark:to-primary/10 p-6 rounded-2xl shadow-lg border border-primary/20 hover:shadow-xl hover:border-primary/30 transition-all duration-300 ${
                        isRtlAdjusted ? 'md:ml-auto' : 'md:mr-auto'
                      } max-w-md backdrop-blur-sm`}
                      variants={{
                        hover: { 
                          x: isRtlAdjusted ? -5 : 5,
                          y: -5,
                          scale: 1.02
                        }
                      }}
                      whileHover="hover"
                    >
                      <div className={`flex items-center mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <motion.div 
                          className={`w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center ${isRtl ? 'ml-4' : 'mr-4'} shadow-lg`}
                          variants={{
                            hover: { 
                              scale: 1.1,
                              rotate: 360
                            }
                          }}
                          transition={{ 
                            type: "spring",
                            stiffness: 200,
                            damping: 10
                          }}
                        >
                          {getIconComponent(step.icon)}
                        </motion.div>
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                          <motion.span 
                            className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-sm font-bold mb-2 shadow-sm"
                            whileHover={{ scale: 1.05 }}
                          >
                            {t('howItWorks.process.step')} {step.id}
                          </motion.span>
                          <h3 className="text-xl font-bold text-gradient-gold">
                            {getTranslatedText(step.title)}
                          </h3>
                        </div>
                      </div>
                      <motion.p 
                        className="text-muted-foreground leading-relaxed text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: activeStep === index ? 1 : 0.9,
                          transition: { delay: 0.2 }
                        }}
                      >
                        {getTranslatedText(step.description)}
                      </motion.p>
                    </motion.div>
                  </motion.div>
                  
                  {/* Center Dot */}
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center z-10 shadow-lg absolute left-1/2 transform -translate-x-1/2 hidden md:flex border-4 border-white dark:border-gray-800"
                    variants={{
                      hover: { 
                        scale: 1.2,
                        rotate: 360
                      }
                    }}
                    whileHover="hover"
                    animate={{
                      scale: activeStep === index ? 1.1 : 1,
                      boxShadow: activeStep === index ? 
                        "0 0 20px rgba(212, 175, 55, 0.5)" : 
                        "0 4px 6px rgba(0, 0, 0, 0.1)"
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 10
                    }}
                  >
                    <span className="text-primary-foreground font-bold text-lg">{step.id}</span>
                  </motion.div>
                  
                  {/* Empty spacer for right side on desktop */}
                  <div className="w-full md:w-1/2"></div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default ProcessTimeline;
