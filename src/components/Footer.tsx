"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight, 
  ArrowRight, 
  Heart, 
  Globe 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  
  const isRtl = locale === 'ar';
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const socials = [
    { 
      icon: <Instagram className="h-5 w-5" />, 
      href: "https://instagram.com", 
      label: "Instagram" 
    },
    { 
      icon: <Facebook className="h-5 w-5" />, 
      href: "https://facebook.com", 
      label: "Facebook" 
    },
    { 
      icon: <Twitter className="h-5 w-5" />, 
      href: "https://twitter.com", 
      label: "Twitter" 
    },
  ];
  
  const quickLinks = [
    { 
      href: "/landing/how-it-works", 
      label: t("nav.howItWorks") || "كيف يعمل" 
    },
    { 
      href: "/landing/packages", 
      label: t("nav.packages") || "باقات العمرة" 
    },
    { 
      href: "/landing/about-us", 
      label: t("nav.about") || "عن الشركة" 
    },
    { 
      href: "/landing/contact", 
      label: t("nav.contact") || "اتصل بنا" 
    },
  ];
  
  const support = [
    { 
      href: "/landing/how-it-works#faqs", 
      label: t("common.faq") || "الأسئلة الشائعة" 
    },
    { 
      href: "/landing/terms", 
      label: t("common.terms") || "الشروط والأحكام" 
    },
    { 
      href: "/landing/privacy", 
      label: t("common.privacy") || "سياسة الخصوصية" 
    },
    { 
      href: "/landing/about-us", 
      label: t("common.about") || "عن UmrahGo" 
    },
  ];
  
  const contacts = [
    {
      icon: <MapPin className="h-5 w-5 text-primary shrink-0" />,
      text: "مكة المكرمة، المملكة العربية السعودية"
    },
    {
      icon: <Phone className="h-5 w-5 text-primary shrink-0" />,
      text: "+966 123 456 789"
    },
    {
      icon: <Mail className="h-5 w-5 text-primary shrink-0" />,
      text: "info@umrahgo.com"
    },
    {
      icon: <Globe className="h-5 w-5 text-primary shrink-0" />,
      text: "www.umrahgo.com"
    }
  ];

  return (
    <footer className="relative">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-br from-primary/30 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary/90">
              {t("footer.newsletter.title") || "اشترك في النشرة الإخبارية"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t("footer.newsletter.description") || "احصل على آخر العروض والتحديثات حول باقات العمرة مباشرة إلى بريدك الإلكتروني"}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t("footer.newsletter.placeholder") || "أدخل بريدك الإلكتروني"}
                className="rounded-full"
              />
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary rounded-full">
                {t("footer.newsletter.button") || "اشترك"}
                <span className={`${isRtl ? 'mr-2' : 'ml-2'}`}>
                  <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
                </span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 pt-20 pb-10 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t("app.name") || "UmrahGo"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("app.description") || "منصة حجز باقات العمرة الأولى في المنطقة، تقدم باقات متنوعة من مكاتب معتمدة لتضمن لك رحلة عمرة لا تُنسى."}
              </p>
              
              <motion.div 
                className="flex space-x-3 rtl:space-x-reverse"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {socials.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary/80 hover:text-primary hover:bg-primary/10 border border-primary/20 hover:border-primary/50 transition-all duration-300"
                    variants={fadeIn}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h3 className="text-lg font-semibold mb-5 text-primary/90">
                {t("common.quickLinks") || "روابط سريعة"}
              </h3>
              <motion.ul 
                className="space-y-3"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {quickLinks.map((link, index) => (
                  <motion.li key={index} variants={fadeIn}>
                    <Link 
                      href={`/${locale}${link.href}`} 
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                    >
                      <ChevronRight className={`h-4 w-4 text-primary/50 group-hover:text-primary transition-colors ${isRtl ? 'rotate-180 ml-2' : 'mr-2'}`} />
                      <span>{link.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h3 className="text-lg font-semibold mb-5 text-primary/90">
                {t("common.support") || "الدعم"}
              </h3>
              <motion.ul 
                className="space-y-3"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {support.map((link, index) => (
                  <motion.li key={index} variants={fadeIn}>
                    <Link 
                      href={`/${locale}${link.href}`} 
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                    >
                      <ChevronRight className={`h-4 w-4 text-primary/50 group-hover:text-primary transition-colors ${isRtl ? 'rotate-180 ml-2' : 'mr-2'}`} />
                      <span>{link.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h3 className="text-lg font-semibold mb-5 text-primary/90">
                {t("common.contactUs") || "اتصل بنا"}
              </h3>
              <motion.ul 
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {contacts.map((contact, index) => (
                  <motion.li key={index} className="flex items-start" variants={fadeIn}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0">
                      {contact.icon}
                    </div>
                    <span className="text-muted-foreground">{contact.text}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </div>

          {/* Copyright Section */}
          <motion.div 
            className="border-t mt-16 pt-8 text-center text-muted-foreground"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <p className="flex items-center justify-center gap-1">
              &copy; {new Date().getFullYear()} UmrahGo. {t("common.allRightsReserved") || "جميع الحقوق محفوظة"}
              <span className="inline-flex items-center text-primary/80">
                <Heart className="h-4 w-4 fill-primary/80 mr-1" /> 
                <span className="hover:text-primary transition-colors">
                  {t("footer.madeWith") || "صنع بكل حب"}
                </span>
              </span>
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Top Wave SVG */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden rotate-180 transform translate-y-[-1px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[50px]">
          <path fill="currentColor" fillOpacity="0.05" d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path fill="currentColor" fillOpacity="0.05" d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path fill="currentColor" fillOpacity="0.05" d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" opacity=".25"></path>
        </svg>
      </div>
    </footer>
  );
}