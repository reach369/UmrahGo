'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  Facebook,
  Twitter,
  Instagram,
  CheckCircle
} from 'lucide-react';

// Services
import { landingService } from '@/services/landing.service';

export default function ContactPage() {
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const t = useTranslations();
  const isRtl = locale === 'ar';
  
  // States
  const [contactData, setContactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await landingService.getContactData();
        setContactData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contact data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      setFormError(null);
      
      // Submit form data to API
      await landingService.submitContactForm(formData);
      
      // Reset form and show success message
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setFormSuccess(true);
      setFormSubmitting(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setFormSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormError(t('contact.form.error') || 'حدث خطأ أثناء إرسال النموذج. يرجى المحاولة مرة أخرى.');
      setFormSubmitting(false);
    }
  };
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
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
              {t('contact.hero.title') || 'تواصل معنا'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('contact.hero.subtitle') || 'نحن هنا للإجابة على استفساراتك ومساعدتك في اختيار الباقة المناسبة'}
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
      
      {/* Contact Info & Form Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Contact Information */}
            <motion.div 
              className="lg:w-1/3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="text-2xl font-bold mb-8 text-primary">{t('contact.info.title') || 'معلومات التواصل'}</h2>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('contact.info.address') || 'العنوان'}</h3>
                    <p className="text-muted-foreground">
                      {contactData?.address || 'شارع الملك فهد، الرياض، المملكة العربية السعودية'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('contact.info.phone') || 'الهاتف'}</h3>
                    <p className="text-muted-foreground">
                      {contactData?.phone || '+966 123 456 789'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('contact.info.email') || 'البريد الإلكتروني'}</h3>
                    <p className="text-muted-foreground">
                      {contactData?.email || 'info@umrahgo.com'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0 flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('contact.info.hours') || 'ساعات العمل'}</h3>
                    <p className="text-muted-foreground">
                      {contactData?.officeHours || 'من الأحد إلى الخميس: 9 صباحًا - 5 مساءً'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h3 className="font-semibold mb-4">{t('contact.info.social') || 'تابعنا على وسائل التواصل الاجتماعي'}</h3>
                <div className="flex space-x-4 rtl:space-x-reverse">
                  <a 
                    href={contactData?.socialMedia?.facebook || 'https://facebook.com'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors duration-300"
                  >
                    <Facebook className="h-5 w-5 text-primary" />
                  </a>
                  <a 
                    href={contactData?.socialMedia?.twitter || 'https://twitter.com'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors duration-300"
                  >
                    <Twitter className="h-5 w-5 text-primary" />
                  </a>
                  <a 
                    href={contactData?.socialMedia?.instagram || 'https://instagram.com'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors duration-300"
                  >
                    <Instagram className="h-5 w-5 text-primary" />
                  </a>
                </div>
              </div>
            </motion.div>
            
            {/* Contact Form */}
            <motion.div 
              className="lg:w-2/3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-card p-8 rounded-xl shadow-md border border-primary/10">
                <h2 className="text-2xl font-bold mb-8 text-primary">{t('contact.form.title') || 'أرسل لنا رسالة'}</h2>
                
                {formSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      {t('contact.form.success.title') || 'تم إرسال رسالتك بنجاح!'}
                    </h3>
                    <p className="text-green-700">
                      {t('contact.form.success.message') || 'سنقوم بالرد عليك في أقرب وقت ممكن. شكراً لتواصلك معنا.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="name" className="mb-2 block">
                          {t('contact.form.name') || 'الاسم'}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder={t('contact.form.namePlaceholder') || 'أدخل اسمك الكامل'}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="mb-2 block">
                          {t('contact.form.email') || 'البريد الإلكتروني'}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder={t('contact.form.emailPlaceholder') || 'أدخل بريدك الإلكتروني'}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone" className="mb-2 block">
                          {t('contact.form.phone') || 'رقم الهاتف'}
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder={t('contact.form.phonePlaceholder') || 'أدخل رقم هاتفك'}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="subject" className="mb-2 block">
                          {t('contact.form.subject') || 'الموضوع'}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          placeholder={t('contact.form.subjectPlaceholder') || 'أدخل موضوع الرسالة'}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <Label htmlFor="message" className="mb-2 block">
                        {t('contact.form.message') || 'الرسالة'}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder={t('contact.form.messagePlaceholder') || 'اكتب رسالتك هنا...'}
                        rows={6}
                      />
                    </div>
                    
                    {formError && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {formError}
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                      disabled={formSubmitting}
                    >
                      {formSubmitting ? (
                        <>
                          <span className="animate-spin mr-2 rtl:ml-2 rtl:mr-0 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                          {t('contact.form.sending') || 'جاري الإرسال...'}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
                          {t('contact.form.submit') || 'إرسال الرسالة'}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="rounded-xl overflow-hidden h-[400px] shadow-md">
            {/* In a real implementation, you would use a proper map component like Google Maps or Mapbox */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3710.4670024887375!2d39.82617491493395!3d21.42200278578406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c204b74c28d467%3A0xb2f543a618225767!2sAl%20Masjid%20Al%20Haram!5e0!3m2!1sen!2s!4v1624451550885!5m2!1sen!2s"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
              title="UmrahGo Location"
            ></iframe>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-6 text-primary">
              {t('contact.cta.title') || 'استعرض باقات العمرة المتاحة'}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t('contact.cta.description') || 'اختر من بين مجموعة متنوعة من باقات العمرة المميزة التي تناسب احتياجاتك وميزانيتك'}
            </p>
            <Link href={`/${locale}/landing/packages`}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary rounded-full"
              >
                {t('contact.cta.button') || 'استعرض الباقات'}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 