/**
 * UmrahGo Theme System Utilities
 * Professional theme management with accessibility and performance optimization
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  accent: string;
  destructive: string;
  success: string;
  warning: string;
  info: string;
}

/**
 * دمج فئات CSS مع معالجة ذكية للتضارب
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * الألوان الأساسية للتطبيق
 */
export const themeColors = {
  primary: {
    50: '#E6F2EF',
    100: '#CCE6DF', 
    200: '#99CCBF',
    300: '#66B39F',
    400: '#33997F',
    500: '#0E6652', // Primary
    600: '#0C5A48',
    700: '#0A4E3E',
    800: '#083D34',
    900: '#062C2A',
  },
  secondary: {
    50: '#FBF8EB',
    100: '#F7F1D7',
    200: '#EFE2B0', 
    300: '#E7D488',
    400: '#DFC661',
    500: '#D4AF37', // Secondary/Gold
    600: '#BF9D32',
    700: '#A5882B',
    800: '#8C7324',
    900: '#735F1E',
  },
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
} as const;

/**
 * التدرجات اللونية
 */
export const gradients = {
  primary: 'linear-gradient(135deg, #0E6652 0%, #084D3E 100%)',
  secondary: 'linear-gradient(135deg, #D4AF37 0%, #BF9D32 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  info: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  error: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
  sunset: 'linear-gradient(135deg, #FF8A80 0%, #FF5722 100%)',
  ocean: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)',
  forest: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)',
  royal: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
} as const;

/**
 * الظلال المخصصة
 */
export const shadows = {
  elegant: '0 8px 30px rgba(14, 102, 82, 0.12)',
  elegantHover: '0 12px 40px rgba(14, 102, 82, 0.18)',
  soft: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
  medium: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
  strong: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
  glow: '0 0 20px rgba(14, 102, 82, 0.3)',
  glowSecondary: '0 0 20px rgba(212, 175, 55, 0.3)',
} as const;

/**
 * إعدادات الانتقالات
 */
export const transitions = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out', 
  slow: '500ms ease-in-out',
  spring: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/**
 * نقاط التوقف للاستجابة
 */
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * مقاسات الخطوط
 */
export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
} as const;

/**
 * المسافات الموحدة
 */
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
  '4xl': '4rem',
  '5xl': '5rem',
  '6xl': '6rem',
} as const;

/**
 * دوال مساعدة للألوان
 */

/**
 * الحصول على لون من المجموعة
 */
export function getThemeColor(
  color: keyof typeof themeColors,
  shade: keyof typeof themeColors.primary = 500
): string {
  return themeColors[color][shade];
}

/**
 * إنشاء متغير CSS
 */
export function createCssVariable(name: string, value: string): string {
  return `--${name}: ${value};`;
}

/**
 * الحصول على تدرج لوني
 */
export function getGradient(gradient: keyof typeof gradients): string {
  return gradients[gradient];
}

/**
 * الحصول على ظل
 */
export function getShadow(shadow: keyof typeof shadows): string {
  return shadows[shadow];
}

/**
 * الحصول على انتقال
 */
export function getTransition(transition: keyof typeof transitions): string {
  return transitions[transition];
}

/**
 * تطبيق ثيم على عنصر
 */


/**
 * كشف ثيم النظام
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * إنشاء متغيرات CSS للثيم
 */
export function generateThemeVariables(theme: 'light' | 'dark'): Record<string, string> {
  const baseColors = {
    primary: theme === 'light' ? '14 102 82' : '51 153 127',
    secondary: theme === 'light' ? '212 175 55' : '223 198 97',
    background: theme === 'light' ? '255 255 255' : '15 23 42',
    foreground: theme === 'light' ? '17 24 39' : '248 250 252',
    card: theme === 'light' ? '255 255 255' : '30 41 59',
    border: theme === 'light' ? '229 231 235' : '51 65 85',
    muted: theme === 'light' ? '241 245 249' : '51 65 85',
  };

  return Object.fromEntries(
    Object.entries(baseColors).map(([key, value]) => [`--${key}`, value])
  );
}

/**
 * إنشاء أساليب مخصصة للثيم
 */
export function createCustomStyles(theme: 'light' | 'dark') {
  const variables = generateThemeVariables(theme);
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n');
}

/**
 * التحقق من صحة الثيم
 */
export function isValidTheme(theme: string): theme is 'light' | 'dark' {
  return theme === 'light' || theme === 'dark';
}

/**
 * تبديل الثيم
 */

/**
 * دوال للعمل مع الألوان
 */

/**
 * تحويل HEX إلى RGB
 */

/**
 * تحويل RGB إلى HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * تغيير شفافية اللون
 */
export function withOpacity(color: string, opacity: number): string {
  const rgb = hexToRgb(color);
  if (rgb) {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
  }
  return color;
}

/**
 * تفتيح اللون
 */
export function lightenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (rgb) {
    const r = Math.min(255, Math.round(rgb[0] + (255 - rgb[0]) * amount));
    const g = Math.min(255, Math.round(rgb[1] + (255 - rgb[1]) * amount));
    const b = Math.min(255, Math.round(rgb[2] + (255 - rgb[2]) * amount));
    return rgbToHex(r, g, b);
  }
  return color;
}

/**
 * تغميق اللون
 */
export function darkenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (rgb) {
    const r = Math.max(0, Math.round(rgb[0] * (1 - amount)));
    const g = Math.max(0, Math.round(rgb[1] * (1 - amount)));
    const b = Math.max(0, Math.round(rgb[2] * (1 - amount)));
    return rgbToHex(r, g, b);
  }
  return color;
}

/**
 * دوال للاستجابة
 */

/**
 * الحصول على قيمة responsive
 */
export function getResponsiveValue<T>(
  values: Partial<Record<keyof typeof breakpoints, T>>,
  fallback: T
): T {
  if (typeof window === 'undefined') return fallback;
  
  const width = window.innerWidth;
  
  if (width >= 1536 && values['2xl']) return values['2xl'];
  if (width >= 1280 && values.xl) return values.xl;
  if (width >= 1024 && values.lg) return values.lg;
  if (width >= 768 && values.md) return values.md;
  if (width >= 640 && values.sm) return values.sm;
  if (values.xs) return values.xs;
  
  return fallback;
}

/**
 * فئات CSS احترافية
 */
export const professionalClasses = {
  // أزرار احترافية
  button: {
    primary: 'btn-gradient-primary',
    secondary: 'btn-gradient-secondary',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors',
    ghost: 'text-primary hover:bg-primary/10 transition-colors',
  },
  
  // بطاقات احترافية
  card: {
    elegant: 'card-elegant',
    hover: 'card-hover',
    minimal: 'bg-card rounded-lg p-4 border border-border',
    elevated: 'bg-card rounded-xl p-6 shadow-lg border border-border',
  },
  
  // نصوص احترافية
  text: {
    gradient: 'text-gradient-primary',
    elegant: 'text-elegant',
    heading: 'text-elegant-heading',
    muted: 'text-muted-foreground',
  },
  
  // خلفيات احترافية
  background: {
    gradient: 'bg-gradient-primary',
    mesh: 'bg-mesh',
    glass: 'bg-glass',
    glassDark: 'bg-glass-dark',
  },
  
  // الحاويات
  container: {
    fluid: 'container-fluid',
    sm: 'container-sm',
    md: 'container-md',
    lg: 'container-lg',
    xl: 'container-xl',
  },
  
  // المرونة
  flex: {
    center: 'flex-center',
    between: 'flex-between',
    start: 'flex-start',
    end: 'flex-end',
  },
  
  // الانتقالات
  transition: {
    smooth: 'transition-smooth',
    fast: 'transition-fast',
    slow: 'transition-slow',
  },
  
  // الظلال
  shadow: {
    elegant: 'shadow-elegant',
    elegantHover: 'shadow-elegant-hover',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    strong: 'shadow-strong',
  },
} as const;

/**
 * دالة للحصول على فئة CSS احترافية
 */
export function getClass(
  category: keyof typeof professionalClasses,
  variant: string
): string {
  const categoryClasses = professionalClasses[category];
  if (categoryClasses && variant in categoryClasses) {
    return (categoryClasses as any)[variant];
  }
  return '';
}

/**
 * إنشاء فئة مخصصة
 */
export function createCustomClass(baseClass: string, ...modifiers: string[]): string {
  return cn(baseClass, ...modifiers);
} 

// Theme detection utilities


export function getReducedMotionPreference(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getHighContrastPreference(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-contrast: high)').matches;
}

// Theme application utilities
export function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Add new theme class
  root.classList.add(theme);
  
  // Add smooth transition class temporarily
  root.classList.add('theme-transition');
  
  // Remove transition class after animation
  setTimeout(() => {
    root.classList.remove('theme-transition');
  }, 300);
  
  // Update meta theme-color for mobile browsers
  updateMetaThemeColor(theme);
}

export function updateMetaThemeColor(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  
  if (metaThemeColor) {
    const backgroundColor = theme === 'dark' ? '#0F172A' : '#FFFFFF';
    metaThemeColor.setAttribute('content', backgroundColor);
  }
}

export function toggleTheme(currentTheme: 'light' | 'dark'): 'light' | 'dark' {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
  return newTheme;
}

// Color utilities
export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number = 0;
  let s: number = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Contrast and accessibility utilities
export function getContrastRatio(color1: string, color2: string): number {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  
  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

export function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const [r, g, b] = rgb.map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

export function isAccessible(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(foreground, background);
  const minRatio = level === 'AAA' ? 7 : 4.5;
  return ratio >= minRatio;
}

export function generateAccessibleColor(baseColor: string, background: string, level: 'AA' | 'AAA' = 'AA'): string {
  const [h, s, l] = hexToHsl(baseColor);
  const minRatio = level === 'AAA' ? 7 : 4.5;
  
  let newL = l;
  let iterations = 0;
  const maxIterations = 100;
  
  while (iterations < maxIterations) {
    const testColor = hslToHex(h, s, newL);
    const ratio = getContrastRatio(testColor, background);
    
    if (ratio >= minRatio) {
      return testColor;
    }
    
    // Adjust lightness based on background
    const backgroundL = hexToHsl(background)[2];
    if (backgroundL > 50) {
      newL = Math.max(0, newL - 5);
    } else {
      newL = Math.min(100, newL + 5);
    }
    
    iterations++;
  }
  
  return baseColor;
}

// Theme persistence utilities
export function saveThemePreference(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('umrahgo-theme', theme);
  } catch (error) {
    console.warn('Failed to save theme preference:', error);
  }
}

export function loadThemePreference(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  
  try {
    const saved = localStorage.getItem('umrahgo-theme');
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved as ThemeMode;
    }
  } catch (error) {
    console.warn('Failed to load theme preference:', error);
  }
  
  return 'system';
}

// Theme watcher utilities
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}

export function watchReducedMotion(callback: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}

// Color palette utilities
export function getColorPalette(theme: 'light' | 'dark'): ColorPalette {
  if (theme === 'dark') {
    return {
      primary: '#34D399',
      secondary: '#FBBF24',
      background: '#0F172A',
      foreground: '#F8FAFC',
      muted: '#334155',
      border: '#475569',
      accent: '#334155',
      destructive: '#FB7185',
      success: '#4ADE80',
      warning: '#FBBF24',
      info: '#7DD3FC',
    };
  }
  
  return {
    primary: '#0E6652',
    secondary: '#D4AF37',
    background: '#FFFFFF',
    foreground: '#111827',
    muted: '#F1F5F9',
    border: '#E2E8F0',
    accent: '#F1F5F9',
    destructive: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
  };
}

// Theme validation utilities
export function validateThemeConfig(config: Partial<ThemeConfig>): ThemeConfig {
  const defaults: ThemeConfig = {
    mode: 'system',
    primaryColor: '#0E6652',
    secondaryColor: '#D4AF37',
    reducedMotion: getReducedMotionPreference(),
    highContrast: getHighContrastPreference(),
  };
  
  return {
    ...defaults,
    ...config,
    mode: ['light', 'dark', 'system'].includes(config.mode || '') ? config.mode as ThemeMode : defaults.mode,
  };
}

// Performance optimization utilities
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Utility for CSS custom properties
export function setCSSCustomProperty(property: string, value: string): void {
  if (typeof document === 'undefined') return;
  
  document.documentElement.style.setProperty(property, value);
}

export function getCSSCustomProperty(property: string): string {
  if (typeof document === 'undefined') return '';
  
  return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
}

// Theme initialization utility
export function initializeTheme(): void {
  if (typeof document === 'undefined') return;
  
  const savedTheme = loadThemePreference();
  const systemTheme = getSystemTheme();
  const reducedMotion = getReducedMotionPreference();
  const highContrast = getHighContrastPreference();
  
  // Apply theme based on preference
  const resolvedTheme = savedTheme === 'system' ? systemTheme : savedTheme;
  applyTheme(resolvedTheme);
  
  // Apply accessibility preferences
  if (reducedMotion) {
    document.documentElement.classList.add('reduce-motion');
  }
  
  if (highContrast) {
    document.documentElement.classList.add('high-contrast');
  }
  
  // Watch for system theme changes
  watchSystemTheme((newTheme) => {
    if (loadThemePreference() === 'system') {
      applyTheme(newTheme);
    }
  });
  
  // Watch for reduced motion changes
  watchReducedMotion((reduced) => {
    if (reduced) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  });
}

export default {
  getSystemTheme,
  getReducedMotionPreference,
  getHighContrastPreference,
  applyTheme,
  toggleTheme,
  updateMetaThemeColor,
  hexToHsl,
  hslToHex,
  getContrastRatio,
  getLuminance,
  isAccessible,
  generateAccessibleColor,
  saveThemePreference,
  loadThemePreference,
  watchSystemTheme,
  watchReducedMotion,
  getColorPalette,
  validateThemeConfig,
  debounce,
  throttle,
  setCSSCustomProperty,
  getCSSCustomProperty,
  initializeTheme,
}; 