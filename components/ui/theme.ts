// نظام الألوان والثيم الخاص بتطبيق UmrahGo

export const colors = {
  // الألوان الأساسية
  primary: {
    DEFAULT: '#0E6652', // اللون الأخضر الأساسي
    50: '#E6F2EF',
    100: '#CCE6DF',
    200: '#99CCBF',
    300: '#66B39F',
    400: '#33997F',
    500: '#0E6652', // نفس اللون الأساسي
    600: '#0C5A48',
    700: '#0A4E3E',
    800: '#083D34',
    900: '#062C2A',
  },
  
  // ألوان ثانوية
  secondary: {
    DEFAULT: '#D4AF37', // اللون الذهبي
    50: '#FBF8EB',
    100: '#F7F1D7',
    200: '#EFE2B0',
    300: '#E7D488',
    400: '#DFC661',
    500: '#D4AF37',
    600: '#BF9D32',
    700: '#A5882B',
    800: '#8C7324',
    900: '#735F1E',
  },
  
  // لون الخلفية
  background: {
    DEFAULT: '#FFFFFF',
    paper: '#F9FAFB',
    light: '#F3F4F6',
    dark: '#111827',
  },
  
  // ألوان النص
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    disabled: '#9CA3AF',
    hint: '#6B7280',
    light: '#FFFFFF',
  },
  
  // ألوان إضافية
  accent: {
    red: '#EF4444',
    green: '#10B981',
    blue: '#3B82F6',
    amber: '#F59E0B',
  },
  
  // تدرجات لونية
  gradients: {
    primary: 'linear-gradient(135deg, #0E6652 0%, #084D3E 100%)',
    secondary: 'linear-gradient(135deg, #D4AF37 0%, #BF9D32 100%)',
    green: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    blue: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    dark: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
  }
};

// ثيمات التطبيق
export const themes = {
  light: {
    primary: colors.primary.DEFAULT,
    secondary: colors.secondary.DEFAULT,
    background: colors.background.DEFAULT,
    paper: colors.background.paper,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    accent: colors.accent.green,
  },
  dark: {
    primary: colors.primary[400],
    secondary: colors.secondary[400],
    background: colors.background.dark,
    paper: '#1F2937',
    text: colors.text.light,
    textSecondary: '#9CA3AF',
    accent: colors.accent.green,
  }
};

// تعريف الظلال
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

// تعريف الحركات والانتقالات
export const transitions = {
  DEFAULT: 'all 0.3s ease',
  fast: 'all 0.15s ease',
  slow: 'all 0.5s ease',
};

// تعريف نصف القطر للزوايا
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// الخطوط المستخدمة
export const typography = {
  fontFamily: {
    sans: ['var(--font-geist-sans)', 'sans-serif'],
    mono: ['var(--font-geist-mono)', 'monospace'],
  },
  fontSize: {
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
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
}; 