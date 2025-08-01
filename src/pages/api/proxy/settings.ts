import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { 
  API_BASE_CONFIG, 
  PUBLIC_ENDPOINTS,
  getFullUrl,
  getCompleteHeaders
} from '@/config/api.config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Settings proxy: Attempting to fetch from API...');
    
    const response = await axios.get(
      getFullUrl(PUBLIC_ENDPOINTS.SETTINGS), 
      {
        headers: getCompleteHeaders(),
        timeout: API_BASE_CONFIG.TIMEOUT.DEFAULT,
      }
    );

    console.log('Settings proxy: Successfully fetched from API');
    res.status(200).json(response.data);
  } catch (error: any) {
    console.log('Settings proxy: API failed, returning sample data');
    
    // Return sample data as fallback
    const sampleData = {
      site_name: 'مكتب العمرة والحج',
      site_address: 'مكة المكرمة، المملكة العربية السعودية',
      site_email: 'info@umrahgo.com',
      site_phone: '+966500000000',
      
      'general.logo': 'settings/sample-logo.png',
      'general.logo_dark': 'settings/sample-logo-dark.png',
      'general.favicon': 'settings/sample-favicon.png',
      
      currency: 'SAR',
      currency_symbol: '﷼',
      
      available_languages: ['ar', 'en'],
      default_language: 'ar',
      
      social_facebook: 'https://facebook.com/umrahgo',
      social_twitter: 'https://twitter.com/umrahgo',
      social_instagram: 'https://instagram.com/umrahgo',
      social_linkedin: '',
      social_whatsapp: '+966500000000',
      social_youtube: '',
      
      seo_meta_title: 'مكتب العمرة والحج - حجز عمرة و حج بأفضل الأسعار',
      seo_meta_description: 'مكتب معتمد لحجز عمرة و حج بأفضل الأسعار والخدمات',
      seo_meta_keywords: 'عمرة, حج, حجز عمرة, السعودية, مكة, المدينة المنورة',
    };

    res.status(200).json({
      status: true,
      code: 200,
      message: 'Sample settings data (API unavailable)',
      data: sampleData
    });
  }
} 