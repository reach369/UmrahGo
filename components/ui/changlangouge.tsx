"use client";

import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

export default function DropdownMenuRadiochanglang() {
  // Get current locale
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get translations with fallbacks
  let translationNamespace = '';
  let t;
  
  try {
    // First try 'nav' namespace
    t = useTranslations('nav');
    translationNamespace = 'nav';
  } catch (error) {
    try {
      // Then try 'Navigation' namespace as fallback
      t = useTranslations('Navigation');
      translationNamespace = 'Navigation';
    } catch (e) {
      // If both fail, we'll use defaults
      console.warn('Could not load translations for nav or Navigation namespaces');
    }
  }
  
  // Safe translation function with fallbacks
  const getLocalizedText = (key: string, defaultValue: string) => {
    if (!t) return defaultValue;
    
    try {
      // Check if translation exists before trying to use it
      if (translationNamespace === 'nav' && key === 'changelag') {
        // Always use default for this problematic key
        return defaultValue;
      }
      return t(key);
    } catch (e) {
      console.warn(`Translation key ${key} not found in ${translationNamespace}`, e);
      return defaultValue;
    }
  };
  
  // Handle language change with preventing locale stacking
  const handleLanguageChange = (locale: string) => {
    if (locale === currentLocale) return; // Avoid reload if language is the same
    
    try {
      // Use replace to swap current locale with new one
      router.replace(pathname, { locale });
    } catch (error) {
      console.error("Language switch error:", error);
      
      // Fallback in case of error - direct redirect
      const pathSegments = pathname.split('/');
      // Skip the first part (empty) and the second part (current locale)
      const pathWithoutLocale = pathSegments.slice(2).join('/');
      window.location.href = `/${locale}/${pathWithoutLocale}`;
    }
  };

  // Determine current language
  const isArabic = currentLocale === "ar";
  const isEnglish = currentLocale === "en";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          {isArabic ? "اللغة" : "Language"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("en")}
          className={isEnglish ? "bg-primary/10" : ""}
        >
          {isEnglish ? "English" : "الإنجليزية"}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("ar")}
          className={isArabic ? "bg-primary/10" : ""}
        >
          {isArabic ? "العربية" : "Arabic"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}