// دالة بسيطة لتحميل الترجمات للغة
export default async function(context: { locale: string }) {
  try {
    const messages: Record<string, any> = {
      ar: require('../../messages/ar.json'),
      en: require('../../messages/en.json')
    };
    
    return {
      messages: messages[context.locale] || {}
    };
  } catch (error) {
    console.error(`Error loading messages for ${context.locale}:`, error);
    return {
      messages: {}
    };
  }
}
