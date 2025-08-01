// تكوين مركزي لإعدادات الترجمة والتدويل في التطبيق

// اللغات المدعومة في التطبيق
export const locales = ['ar', 'en'] as const;

// اللغة الافتراضية
export const defaultLocale = 'ar' as const;

// إعدادات الترجمة
export const i18nConfig = {
  // قائمة اللغات المدعومة
  locales,
  
  // اللغة الافتراضية
  defaultLocale,
  
  // دائماً استخدم بريفكس اللغة في عناوين URL
  localePrefix: 'always',
  
  // تعطيل روابط اللغات البديلة
  alternateLinks: false,
  
  // تمكين اكتشاف اللغة تلقائياً
  localeDetection: true
} as const;

// الدالة المساعدة للتحقق من صحة اللغة
export function isValidLocale(locale: string): boolean {
  return locales.includes(locale as any);
}

// الدالة المساعدة للحصول على اللغة من المسار
export function getLocaleFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0 && isValidLocale(segments[0])) {
    return segments[0];
  }
  return defaultLocale;
}

// الدالة المساعدة لإزالة اللغات المكررة من المسار
export function removeExtraLocales(path: string): string {
  const segments = path.split('/').filter(Boolean);
  
  // إذا لم يكن هناك أي جزء في المسار، أرجع المسار الجذر
  if (segments.length === 0) return '/';
  
  // تحقق من وجود لغة في بداية المسار
  const hasLocalePrefix = isValidLocale(segments[0]);
  
  // إذا لم يكن هناك بريفكس لغة، أرجع المسار كما هو
  if (!hasLocalePrefix) return path;
  
  // احتفظ باللغة الأولى وأزل أي لغات أخرى
  const locale = segments[0];
  const pathWithoutExtraLocales = segments
    .slice(1)
    .filter(segment => !isValidLocale(segment))
    .join('/');
  
  return `/${locale}${pathWithoutExtraLocales ? '/' + pathWithoutExtraLocales : ''}`;
}
