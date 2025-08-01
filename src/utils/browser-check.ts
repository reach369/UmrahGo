/**
 * التحقق مما إذا كان المتصفح يدعم المتغيرات CSS وتأثيرات CSS المتقدمة
 */
export function checkBrowserSupport(): {
  supportsCssVariables: boolean;
  supportsBackdropFilter: boolean;
} {
  // تنفيذ هذه الوظيفة فقط في جانب العميل
  if (typeof window === 'undefined') {
    return {
      supportsCssVariables: true,
      supportsBackdropFilter: true
    };
  }

  // التحقق من دعم متغيرات CSS
  const supportsCssVariables = 
    window.CSS && 
    window.CSS.supports && 
    window.CSS.supports('--fake-var: 0');

  // التحقق من دعم backdrop-filter
  const supportsBackdropFilter = 
    window.CSS && 
    window.CSS.supports && 
    (window.CSS.supports('backdrop-filter: blur(10px)') || 
     window.CSS.supports('-webkit-backdrop-filter: blur(10px)'));

  return {
    supportsCssVariables,
    supportsBackdropFilter
  };
}

/**
 * تحديث علامات في HTML للإشارة إلى دعم المتصفح
 */
export function applyBrowserSupport(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const { supportsCssVariables, supportsBackdropFilter } = checkBrowserSupport();

  // إضافة فئات للعنصر HTML
  if (supportsCssVariables) {
    document.documentElement.classList.add('supports-css-vars');
  } else {
    document.documentElement.classList.add('no-css-vars');
  }

  if (supportsBackdropFilter) {
    document.documentElement.classList.add('supports-backdrop');
  } else {
    document.documentElement.classList.add('no-backdrop');
  }
} 