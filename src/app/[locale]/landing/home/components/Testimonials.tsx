'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Components
import { Star } from 'lucide-react';

// Services and Types
import { landingService, Testimonial } from '@/services/landing.service';

export default function Testimonials() {
  const t = useTranslations();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const data = await landingService.getTestimonials();
        setTestimonials(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setLoading(false);
        
        // Fallback testimonials if API fails
        setTestimonials([
          {
              id: '1',
              name: 'محمد أحمد',
              content: 'رحلة العمرة مع عمرة جو كانت من أفضل التجارب في حياتي. الخدمات كانت ممتازة والمكتب كان محترف جداً.',
              rating: 5,
              avatar: '/images/avatar-1.jpg',
              position: 'مدير تنفيذي',
              text: 'رحلة العمرة مع عمرة جو كانت من أفضل التجارب في حياتي. الخدمات كانت ممتازة والمكتب كان محترف جداً.',
              location: 'الرياض، السعودية',
              date: '2023-05-15'
          },
          {
              id: '2',
              name: 'فاطمة علي',
              content: 'شكراً لمنصة عمرة جو على التسهيلات وجودة الخدمة. الباقات متنوعة والأسعار مناسبة للجميع.',
              rating: 4,
              avatar: '/images/avatar-2.jpg',
              position: 'معلمة',
              text: 'شكراً لمنصة عمرة جو على التسهيلات وجودة الخدمة. الباقات متنوعة والأسعار مناسبة للجميع.',
              location: 'دبي، الإمارات',
              date: '2023-04-22'
          },
          {
              id: '3',
              name: 'أحمد محمود',
              content: 'التنظيم كان رائعاً والاهتمام بالتفاصيل كان ملحوظاً. أنصح الجميع بالتعامل مع عمرة جو لتجربة عمرة لا تُنسى.',
              rating: 5,
              avatar: '/images/avatar-3.jpg',
              position: 'طبيب',
              text: 'التنظيم كان رائعاً والاهتمام بالتفاصيل كان ملحوظاً. أنصح الجميع بالتعامل مع عمرة جو لتجربة عمرة لا تُنسى.',
              location: 'جدة، السعودية',
              date: '2023-06-03'
          }
        ]);
      }
    };

    fetchTestimonials();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, [testimonials]);

  // Rating stars renderer
  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index} 
        size={18}
        className={`${index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  // Click handlers for dots navigation
  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-primary"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t('home.testimonials.title') || 'ما يقوله عملاؤنا'}
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('home.testimonials.subtitle') || 'تجارب وقصص نجاح حقيقية من عملائنا الكرام'}
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {loading ? (
            // Loading state
            <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12 animate-pulse">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20"></div>
              </div>
              <div className="h-4 bg-primary/10 rounded mb-4 w-32 mx-auto"></div>
              <div className="h-3 bg-primary/10 rounded mb-6 w-24 mx-auto"></div>
              <div className="flex justify-center mb-6">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full bg-primary/20"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-primary/5 rounded w-full"></div>
                <div className="h-3 bg-primary/5 rounded w-full"></div>
                <div className="h-3 bg-primary/5 rounded w-full"></div>
                <div className="h-3 bg-primary/5 rounded w-5/6 mx-auto"></div>
              </div>
            </div>
          ) : testimonials.length > 0 ? (
            <>
              {/* Testimonial Carousel */}
              <div className="overflow-hidden">
                <div className="relative">
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={testimonial.id}
                      className={`bg-card rounded-2xl shadow-lg p-8 md:p-12 text-center absolute inset-0 transition-opacity duration-500 ${
                        index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: index === activeIndex ? 1 : 0,
                        scale: index === activeIndex ? 1 : 0.9,
                        zIndex: index === activeIndex ? 10 : 0
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="mb-6">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto border-4 border-primary/20">
                          <Image
                            src={testimonial.avatar || testimonial.avatarUrl || '/images/avatar-placeholder.jpg'}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-1 text-primary">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{testimonial.position || ''}</p>
                      
                      <div className="flex justify-center mb-6">
                        <div className="flex">
                          {renderRatingStars(testimonial.rating)}
                        </div>
                      </div>
                      
                      <p className="text-lg italic">"{testimonial.content || testimonial.text}"</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Dots Navigation */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      index === activeIndex ? 'bg-primary' : 'bg-primary/30'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            // Empty state
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {t('home.testimonials.empty') || 'لا توجد تقييمات متاحة حالياً'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 