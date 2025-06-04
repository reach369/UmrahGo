'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import { 
  UserIcon, 
  BuildingOffice2Icon, 
  CheckIcon,
} from '@heroicons/react/24/outline';
import { ArrowRight, CheckCircle } from 'lucide-react';

// Services
import { landingService, HowItWorksStep } from '@/services/landing.service';

export default function HowItWorksPage() {
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const t = useTranslations();
  const isRtl = locale === 'ar';
  
  // State for API data
  const [steps, setSteps] = useState<HowItWorksStep[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stepsData = await landingService.getHowItWorksSteps();
        setSteps(stepsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching how it works data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // User types data
  const userTypes = [
    {
      id: 'pilgrim',
      title: t('howItWorks.userTypes.pilgrim.title') || 'المعتمر',
      description: t('howItWorks.userTypes.pilgrim.description') || 'للأفراد الذين يرغبون في حجز باقات العمرة',
      steps: [
        t('howItWorks.userTypes.pilgrim.steps.1') || 'إنشاء حساب معتمر جديد',
        t('howItWorks.userTypes.pilgrim.steps.2') || 'استعراض باقات العمرة المتاحة',
        t('howItWorks.userTypes.pilgrim.steps.3') || 'اختيار الباقة المناسبة والحجز',
        t('howItWorks.userTypes.pilgrim.steps.4') || 'إتمام عملية الدفع',
        t('howItWorks.userTypes.pilgrim.steps.5') || 'استلام تأكيد الحجز والمستندات',
      ],
      icon: <UserIcon className="h-10 w-10 text-primary" />,
    },
    {
      id: 'office',
      title: t('howItWorks.userTypes.office.title') || 'مكتب العمرة',
      description: t('howItWorks.userTypes.office.description') || 'لمكاتب العمرة التي ترغب في عرض باقاتها',
      steps: [
        t('howItWorks.userTypes.office.steps.1') || 'التسجيل كمكتب عمرة معتمد',
        t('howItWorks.userTypes.office.steps.2') || 'إضافة باقات العمرة والخدمات',
        t('howItWorks.userTypes.office.steps.3') || 'إدارة الحجوزات والطلبات',
        t('howItWorks.userTypes.office.steps.4') || 'التواصل مع المعتمرين',
        t('howItWorks.userTypes.office.steps.5') || 'استلام المدفوعات وإدارة الحسابات',
      ],
      icon: <BuildingOffice2Icon className="h-10 w-10 text-primary" />,
    },
  ];
  
  // FAQ questions
  const faqs = [
    {
      question: t('howItWorks.faqs.1.question') || 'ما هي المستندات المطلوبة للسفر لأداء العمرة؟',
      answer: t('howItWorks.faqs.1.answer') || 'تحتاج إلى جواز سفر ساري المفعول لمدة 6 أشهر على الأقل، تأشيرة العمرة، شهادة التطعيم ضد الأمراض المعدية، وصورة شخصية بخلفية بيضاء.',
    },
    {
      question: t('howItWorks.faqs.2.question') || 'كيف يمكنني إلغاء أو تعديل حجزي؟',
      answer: t('howItWorks.faqs.2.answer') || 'يمكنك إلغاء أو تعديل حجزك من خلال حسابك الشخصي على الموقع. يرجى ملاحظة أن سياسات الإلغاء تختلف حسب الباقة وموعد الإلغاء.',
    },
    {
      question: t('howItWorks.faqs.3.question') || 'هل يمكنني حجز باقة لمجموعة من الأشخاص؟',
      answer: t('howItWorks.faqs.3.answer') || 'نعم، يمكنك حجز باقات للعائلات والمجموعات. يمكنك تحديد عدد الأشخاص أثناء عملية الحجز وإضافة بياناتهم.',
    },
    {
      question: t('howItWorks.faqs.4.question') || 'ما هي وسائل الدفع المتاحة؟',
      answer: t('howItWorks.faqs.4.answer') || 'نوفر العديد من وسائل الدفع الآمنة بما في ذلك بطاقات الائتمان، بطاقات الخصم المباشر، والتحويل البنكي، وأنظمة الدفع الإلكتروني.',
    },
    {
      question: t('howItWorks.faqs.5.question') || 'هل يشمل سعر الباقة تذاكر الطيران؟',
      answer: t('howItWorks.faqs.5.answer') || 'تختلف الباقات في محتوياتها. بعض الباقات تشمل تذاكر الطيران، بينما البعض الآخر لا يشملها. يرجى التحقق من تفاصيل الباقة قبل الحجز.',
    },
  ];
  
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
              {t('howItWorks.hero.title') || 'كيف تعمل خدمة UmrahGo؟'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('howItWorks.hero.subtitle') || 'نقدم لك دليلًا مبسطًا يشرح كيفية حجز باقة العمرة الخاصة بك بسهولة وأمان من خلال منصتنا'}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link href={`/${locale}/landing/packages`}>
                <Button size="lg" className="rounded-full text-lg px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/20">
                  {t('howItWorks.hero.button1') || 'تصفح الباقات'}
                  <span className={`${isRtl ? 'mr-2' : 'ml-2'}`}>
                    <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </span>
                </Button>
              </Link>
              <Link href={`/${locale}/contact`}>
                <Button variant="outline" size="lg" className="rounded-full text-lg px-8 border-primary/30 hover:bg-primary/5">
                  {t('howItWorks.hero.button2') || 'تواصل معنا'}
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
              {t('howItWorks.process.title') || 'عملية الحجز البسيطة'}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('howItWorks.process.subtitle') || 'اتبع هذه الخطوات البسيطة لحجز رحلة العمرة الخاصة بك من خلال منصتنا'}
            </p>
          </motion.div>
          
          <div className="max-w-5xl mx-auto relative">
            {/* Timeline Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-primary/30 -translate-x-1/2 hidden md:block"></div>
            
            {loading ? (
              // Loading skeleton
              Array(4).fill(0).map((_, index) => (
                <div 
                  key={index}
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center mb-12 md:mb-24`}
                >
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} mb-6 md:mb-0`}>
                    <div className="bg-card p-6 rounded-xl shadow-md animate-pulse">
                      <div className="flex items-center mb-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 mr-4"></div>
                        <div>
                          <div className="h-6 bg-primary/10 rounded mb-1 w-20"></div>
                          <div className="h-7 bg-primary/10 rounded w-40"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-primary/5 rounded mb-2 w-full"></div>
                      <div className="h-4 bg-primary/5 rounded w-5/6"></div>
                    </div>
                  </div>
                  <div className="md:w-1/2 relative md:hidden">
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-primary/30 -translate-x-1/2"></div>
                  </div>
                  <div className="md:w-1/2 hidden md:block">
                    <div className="w-10 h-10 rounded-full bg-primary/10 absolute left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              // Actual steps
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-12 md:space-y-0 relative"
              >
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    variants={fadeIn}
                    className={`flex flex-col md:flex-row items-center ${
                      index % 2 === 0
                        ? 'md:flex-row-reverse text-right'
                        : 'text-left'
                    } relative md:mb-24`}
                  >
                    <div className="md:w-1/2 mb-6 md:mb-0 md:px-10">
                      <div className={`bg-card p-6 rounded-xl shadow-md border border-primary/10 hover:border-primary/20 transition-all duration-300 ${
                        index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'
                      } max-w-md`}>
                        <div className="flex items-center mb-4">
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0">
                            {getIconComponent(step.icon)}
                          </div>
                          <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-sm font-medium mb-1">
                              {t('howItWorks.process.step') || 'الخطوة'} {step.id}
                            </span>
                            <h3 className="text-xl font-bold text-primary">{step.title}</h3>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    
                    {/* Center Dot */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center z-10 shadow-lg md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
                      <span className="text-white font-bold">{step.id}</span>
                    </div>
                    
                    <div className="md:w-1/2"></div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* User Types Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              {t('howItWorks.userTypes.title') || 'خدماتنا لمختلف المستخدمين'}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('howItWorks.userTypes.subtitle') || 'نقدم خدماتنا لمختلف أنواع المستخدمين سواء كنت معتمرًا أو مكتب عمرة'}
            </p>
          </motion.div>
          
          <div className="space-y-20">
            {userTypes.map((type, typeIndex) => (
              <div 
                key={type.id}
                className={`flex flex-col ${typeIndex % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
              >
                <motion.div 
                  className="md:w-1/2"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                >
                  <h3 className="text-2xl font-bold mb-4 text-primary">{type.title}</h3>
                  <p className="text-muted-foreground mb-8">{type.description}</p>
                  
                  <motion.ul
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {type.steps.map((step, index) => (
                      <motion.li key={index} className="flex items-start" variants={fadeIn}>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 mt-1 flex-shrink-0">
                          <span className="text-primary font-bold">{index + 1}</span>
                        </div>
                        <span>{step}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                  
                  <div className="mt-8">
                    <Link href={type.id === 'pilgrim' ? `/${locale}/auth/register` : `/${locale}/auth/register/office`}>
                      <Button size="lg" className="rounded-full text-lg px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg">
                        {type.id === 'pilgrim'
                          ? t('howItWorks.userTypes.pilgrimButton') || 'إنشاء حساب معتمر'
                          : t('howItWorks.userTypes.officeButton') || 'تسجيل كمكتب عمرة'}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="md:w-1/2 flex justify-center"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                >
                  <div className="relative w-full max-w-md">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                            {type.icon}
                          </div>
                        </div>
                      </div>
                      
                      {/* Decorative Circles */}
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-16 h-16 rounded-full bg-primary/5"
                          animate={{
                            x: Math.sin(i * 1.5) * 100,
                            y: Math.cos(i * 1.5) * 100,
                            opacity: [0.4, 0.8, 0.4],
                          }}
                          transition={{
                            duration: 5 + i,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
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
              {t('howItWorks.faqs.title') || 'الأسئلة الشائعة'}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('howItWorks.faqs.subtitle') || 'إجابات على الأسئلة الشائعة حول خدمات العمرة وعملية الحجز'}
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
                {t('howItWorks.faqs.more') || 'لم تجد إجابة لسؤالك؟ تواصل مع فريق الدعم لدينا للمساعدة'}
              </p>
              <Link href={`/${locale}/contact`}>
                <Button variant="outline" className="rounded-full border-primary/30 hover:bg-primary/5">
                  {t('howItWorks.faqs.button') || 'تواصل مع الدعم'}
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
              {t('howItWorks.cta.title') || 'جاهز لبدء رحلة العمرة الخاصة بك؟'}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t('howItWorks.cta.description') || 'احجز باقة العمرة الخاصة بك الآن واستعد لتجربة روحانية لا تُنسى'}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={`/${locale}/landing/packages`}>
                <Button size="lg" className="rounded-full text-lg px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg">
                  {t('howItWorks.cta.button1') || 'استعرض الباقات'}
                  <span className={`${isRtl ? 'mr-2' : 'ml-2'}`}>
                    <ArrowRight className={`h-5 w-5 ${isRtl ? 'rotate-180' : ''}`} />
                  </span>
                </Button>
              </Link>
              <Link href={`/${locale}/landing/about-us`}>
                <Button variant="outline" size="lg" className="rounded-full text-lg px-8 border-primary/30 hover:bg-primary/5">
                  {t('howItWorks.cta.button2') || 'معرفة المزيد'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/10 backdrop-blur-sm"
            style={{
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 50 - 25],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </section>
    </div>
  );
}

// Helper function to render the correct icon based on string name
function getIconComponent(iconName: string) {
  switch (iconName) {
    case 'Search':
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>;
    case 'CreditCard':
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>;
    case 'Calendar':
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>;
    case 'Users':
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>;
    default:
      return <CheckCircle className="h-6 w-6 text-primary" />;
  }
} 