'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Award,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

// Services
import { landingService } from '@/services/landing.service';

export default function AboutUsPage() {
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const t = useTranslations();
  const isRtl = locale === 'ar';
  
  // States
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await landingService.getAboutData();
        setAboutData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching about data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
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
      <section className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              {aboutData?.title || t('about.hero.title') || 'عن UmrahGo'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {aboutData?.description || t('about.hero.subtitle') || 'منصة متكاملة تقدم خدمات العمرة بجودة عالية وأسعار منافسة'}
            </p>
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
      
      {/* Mission & Vision Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12">
            <motion.div 
              className="md:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="bg-card p-8 rounded-xl border border-primary/10 h-full">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-primary">{t('about.mission.title') || 'رسالتنا'}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {aboutData?.mission || t('about.mission.description') || 'تسهيل رحلة العمرة لكل مسلم في أنحاء العالم من خلال تقديم خدمات متكاملة عالية الجودة وبأسعار منافسة، مع ضمان راحة المعتمر وتيسير أداء المناسك.'}
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-card p-8 rounded-xl border border-primary/10 h-full">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-primary">{t('about.vision.title') || 'رؤيتنا'}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {aboutData?.vision || t('about.vision.description') || 'أن نكون الخيار الأول للمعتمرين من جميع أنحاء العالم، وأن نقدم تجربة فريدة تجمع بين التكنولوجيا الحديثة والخدمة الشخصية لضمان رحلة عمرة روحانية مريحة.'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
              {t('about.values.title') || 'قيمنا'}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('about.values.subtitle') || 'المبادئ التي نسترشد بها في تقديم خدماتنا'}
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {(aboutData?.values || ['الجودة العالية', 'الشفافية', 'الاحترافية', 'الالتزام الديني', 'خدمة العملاء']).map((value: string, index: number) => (
              <motion.div 
                key={index}
                className="bg-card rounded-xl p-6 border border-primary/10 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                variants={fadeIn}
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value}</h3>
                <p className="text-muted-foreground">
                  {t(`about.values.descriptions.${index}`) || 'نلتزم بتقديم أفضل الخدمات بما يتوافق مع قيمنا الأساسية.'}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(aboutData?.stats || [
                { value: 10000, label: 'معتمر سعيد' },
                { value: 15, label: 'سنة خبرة' },
                { value: 200, label: 'باقة متنوعة' }
              ]).map((stat: any, index: number) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}+</div>
                  <div className="text-lg text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
              {t('about.team.title') || 'فريقنا'}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('about.team.subtitle') || 'تعرف على الفريق المتميز الذي يعمل على تقديم أفضل خدمات العمرة'}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(aboutData?.team || [
              {
                name: 'أحمد محمد',
                position: 'المدير التنفيذي',
                bio: 'خبرة 15 عام في مجال السياحة الدينية',
                imageUrl: '/images/team-1.jpg'
              },
              {
                name: 'سارة علي',
                position: 'مدير العمليات',
                bio: 'متخصصة في إدارة العمليات السياحية',
                imageUrl: '/images/team-2.jpg'
              },
              {
                name: 'محمد خالد',
                position: 'مدير خدمة العملاء',
                bio: 'خبرة واسعة في تطوير تجربة العملاء',
                imageUrl: '/images/team-3.jpg'
              }
            ]).map((member: any, index: number) => (
              <motion.div 
                key={index}
                className="bg-card rounded-xl overflow-hidden shadow-md border border-primary/10 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative h-64 overflow-hidden">
                  <Image 
                    src={member.imageUrl || '/images/avatar-placeholder.jpg'} 
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary mb-3">{member.position}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-8 md:p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
              {t('about.cta.title') || 'هل أنت جاهز لبدء رحلة العمرة؟'}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('about.cta.subtitle') || 'انضم إلى آلاف المعتمرين السعداء واستمتع بتجربة عمرة لا تُنسى مع UmrahGo'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={`/${locale}/landing/packages`}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary rounded-full"
                >
                  {t('about.cta.browsePackages') || 'استعرض الباقات'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={`/${locale}/landing/contact`}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full border-primary/30 hover:bg-primary/5"
                >
                  {t('about.cta.contactUs') || 'تواصل معنا'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 