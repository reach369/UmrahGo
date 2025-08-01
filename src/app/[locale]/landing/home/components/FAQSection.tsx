'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

// Components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQSection() {
  const t = useTranslations();
  
  // FAQ data - in a real app, this could come from an API
  const faqs = [
    {
      id: 'faq-1',
      question: 'ما هي أفضل فترة لأداء العمرة؟',
      answer: 'يمكن أداء العمرة على مدار العام، لكن الفترات الأكثر هدوءاً تكون خارج موسم الحج وشهر رمضان. يُفضل تجنب مواسم الذروة إذا كنت تفضل أجواء أكثر هدوءاً.'
    },
    {
      id: 'faq-2',
      question: 'ما هي الأوراق المطلوبة للحصول على تأشيرة العمرة؟',
      answer: 'تشمل المتطلبات الأساسية: جواز سفر ساري المفعول لمدة 6 أشهر على الأقل، صور شخصية، شهادة التطعيم ضد الأمراض المعدية، وحجز الفندق والطيران. يجب التحقق من أي متطلبات إضافية قد تكون مطلوبة حسب بلد إقامتك.'
    },
    {
      id: 'faq-3',
      question: 'هل يمكنني تعديل حجزي بعد إتمامه؟',
      answer: 'نعم، يمكن تعديل الحجز قبل تاريخ السفر بفترة كافية حسب سياسة المكتب. قد تطبق بعض الرسوم الإضافية على التعديلات حسب نوع الباقة وموعد التعديل.'
    },
    {
      id: 'faq-4',
      question: 'كيف يمكنني اختيار المكتب المناسب لرحلة العمرة؟',
      answer: 'يمكنك الاطلاع على تقييمات المعتمرين السابقين، ومراجعة تفاصيل الخدمات المقدمة، والتأكد من اعتماد المكتب رسمياً. نوصي بمقارنة عدة عروض والتحقق من جودة الإقامة والمواصلات والخدمات الإضافية.'
    },
    {
      id: 'faq-5',
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'نوفر طرق دفع متعددة تشمل البطاقات الائتمانية، التحويل البنكي، الدفع الإلكتروني عبر المحافظ الرقمية، والدفع عند مقر المكتب. يمكنك اختيار الطريقة الأنسب لك عند إتمام الحجز.'
    }
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-primary"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t('home.faq.title') || 'الأسئلة الشائعة'}
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('home.faq.subtitle') || 'إجابات على الأسئلة الأكثر شيوعاً حول العمرة والحجز'}
          </motion.p>
        </div>
        
        <motion.div 
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={faq.id}
                variants={itemVariants}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <AccordionItem 
                  value={faq.id} 
                  className="border border-primary/10 rounded-lg overflow-hidden bg-card shadow-sm"
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-primary/5 hover:no-underline">
                    <span className="font-semibold text-primary text-right">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
} 