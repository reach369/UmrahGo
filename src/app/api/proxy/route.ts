import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { 
  API_BASE_CONFIG, 
  PUBLIC_ENDPOINTS,
  getFullUrl,
  getCompleteHeaders,
  buildQueryString
} from '@/config/api.config';

// Define the real API URL directly for reliability
//const REAL_API_URL = 'https://admin.umrahgo.net/api/v1';
const REAL_API_URL = 'http://127.0.0.1:8000';

// This is a catch-all route to proxy all API requests
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'packages';
  const timestamp = new Date().getTime();
  
  // Map endpoint type to API path
  const apiPathMap: Record<string, string> = {
    'packages': PUBLIC_ENDPOINTS.PACKAGES.LIST,
    'offices': PUBLIC_ENDPOINTS.OFFICES.LIST,
    'featured-packages': PUBLIC_ENDPOINTS.PACKAGES.LIST, // Use packages endpoint with is_featured param
    'how-it-works': PUBLIC_ENDPOINTS.HOW_IT_WORKS,
    'testimonials': PUBLIC_ENDPOINTS.TESTIMONIALS, 
    'features': PUBLIC_ENDPOINTS.FEATURES,
    'settings': PUBLIC_ENDPOINTS.SETTINGS
  };
  
  // Validate endpoint type
  if (!(type in apiPathMap)) {
    return NextResponse.json(
      { error: `Invalid endpoint type: ${type}` },
      { status: 400 }
    );
  }

  try {
    console.log(`Proxy: Fetching ${type} from ${getFullUrl(apiPathMap[type])}`);
    
    // Prepare request parameters
    const requestParams: any = {
      _t: timestamp // Cache busting
    };
    
    // Add is_featured param for featured packages
    if (type === 'featured-packages') {
      requestParams.is_featured = true;
      requestParams.per_page = 6;
    }
    
    const response = await axios.get(getFullUrl(apiPathMap[type]), {
      headers: getCompleteHeaders({
        'Cache-Control': 'no-cache',
      }),
      timeout: API_BASE_CONFIG.TIMEOUT.DEFAULT,
      params: requestParams
    });

    console.log(`Proxy: Successfully fetched ${type}`, {
      status: response.status,
      dataLength: response.data?.data?.length || 'N/A'
    });

    return NextResponse.json(response.data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error: any) {
    console.error(`Proxy error for ${type}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data?.message || error.response?.data
    });

    // Return sample data for specific types when API fails
    const sampleData = getSampleDataForType(type);
    if (sampleData) {
      console.log(`Proxy: Returning sample data for ${type} due to API failure`);
      return NextResponse.json({
        status: true,
        code: 200,
        message: `Sample data for ${type} (API unavailable)`,
        data: sampleData
      }, { status: 200 });
    }

    // If no sample data available, return error
    return NextResponse.json(
      { 
        error: `Failed to fetch ${type}`,
        details: error.message,
        status: error.response?.status || 500,
        fallback: 'No sample data available'
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Sample data fallbacks
function getSampleDataForType(type: string) {
  switch (type) {
    case 'settings':
      return {
        site_name: 'مكتب العمرة والحج',
        site_address: 'مكة المكرمة، المملكة العربية السعودية',
        site_email: 'info@umrahgo.com',
        site_phone: '+966500000000',
        
        'general.logo': '',
        'general.logo_dark': '',
        'general.favicon': '',
        
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
    
    case 'how-it-works':
      return [
        {
          id: 1,
          title: 'ابحث عن الباقة المناسبة',
          description: 'تصفح مجموعة واسعة من باقات العمرة واختر ما يناسب احتياجاتك وميزانيتك',
          icon: 'search',
          order: 1
        },
        {
          id: 2,
          title: 'احجز بسهولة',
          description: 'أكمل عملية الحجز بخطوات بسيطة وآمنة عبر منصتنا الإلكترونية',
          icon: 'booking',
          order: 2
        },
        {
          id: 3,
          title: 'استمتع برحلتك',
          description: 'استمتع بتجربة روحانية مميزة مع خدماتنا المتكاملة ودعمنا على مدار الساعة',
          icon: 'journey',
          order: 3
        },
        {
          id: 4,
          title: 'تقييم التجربة',
          description: 'شاركنا تجربتك وقيّم الخدمة لنتمكن من تحسين خدماتنا باستمرار',
          icon: 'feedback',
          order: 4
        }
      ];
    
    case 'testimonials':
      return [
        {
          id: '1',
          name: 'أحمد محمد',
          content: 'تجربة رائعة مع خدمة ممتازة ومنظمة جداً. أنصح بها بشدة',
          rating: 5,
          location: 'الرياض، المملكة العربية السعودية',
          date: '2024-01-15',
          avatar: '/images/testimonial-1.jpg'
        },
        {
          id: '2',
          name: 'فاطمة الزهراء',
          content: 'خدمة احترافية وأسعار مناسبة. الفريق متعاون جداً',
          rating: 5,
          location: 'جدة، المملكة العربية السعودية',
          date: '2024-01-10',
          avatar: '/images/testimonial-2.jpg'
        },
        {
          id: '3',
          name: 'محمد علي',
          content: 'باقة شاملة ومنظمة بشكل ممتاز. سأكررها إن شاء الله',
          rating: 5,
          location: 'الدمام، المملكة العربية السعودية',
          date: '2024-01-05',
          avatar: '/images/testimonial-3.jpg'
        }
      ];
    
    case 'features':
      return [
        {
          id: '1',
          title: 'حجز سهل وآمن',
          description: 'نظام حجز متطور وآمن يضمن حماية بياناتك الشخصية',
          icon: 'shield'
        },
        {
          id: '2',
          title: 'أسعار تنافسية',
          description: 'أفضل الأسعار في السوق مع ضمان الجودة والخدمة المميزة',
          icon: 'dollar'
        },
        {
          id: '3',
          title: 'دعم 24/7',
          description: 'فريق دعم متاح على مدار الساعة لمساعدتك في أي وقت',
          icon: 'support'
        },
        {
          id: '4',
          title: 'مكاتب معتمدة',
          description: 'جميع مكاتب العمرة على منصتنا معتمدة ومرخصة رسمياً',
          icon: 'verified'
        },
        {
          id: '5',
          title: 'باقات متنوعة',
          description: 'مجموعة واسعة من الباقات لتناسب جميع الاحتياجات والميزانيات',
          icon: 'packages'
        },
        {
          id: '6',
          title: 'خدمة متكاملة',
          description: 'خدمات شاملة من الحجز حتى العودة لضمان رحلة مريحة',
          icon: 'service'
        }
      ];

    case 'featured-packages':
      return {
        data: [
          {
            id: 1,
            office_id: 1,
            name: 'باقة العمرة الذهبية',
            description: 'باقة عمرة متكاملة تشمل الإقامة في فندق 5 نجوم والنقل والإفطار',
            price: 2500,
            discount_price: 2200,
            duration_days: 7,
            is_featured: true,
            status: 'active',
            start_location: 'الرياض',
            end_location: 'مكة المكرمة',
            office: {
              id: 1,
              office_name: 'مكتب الحرمين للعمرة',
              rating: 4.8,
              services_offered: 'نقل، إقامة، وجبات'
            },
            images: [
              {
                id: 1,
                image: '/images/kaaba.jpg',
                is_featured: true
              }
            ]
          },
          {
            id: 2,
            office_id: 2,
            name: 'باقة العمرة الفضية',
            description: 'باقة عمرة اقتصادية مع خدمات أساسية عالية الجودة',
            price: 1800,
            duration_days: 5,
            is_featured: true,
            status: 'active',
            start_location: 'جدة',
            end_location: 'مكة المكرمة',
            office: {
              id: 2,
              office_name: 'مكتب طيبة للحج والعمرة',
              rating: 4.5,
              services_offered: 'نقل، إقامة'
            },
            images: [
              {
                id: 2,
                image: '/images/medina.jpg',
                is_featured: true
              }
            ]
          },
          {
            id: 3,
            office_id: 3,
            name: 'باقة العمرة البرونزية',
            description: 'باقة عمرة ميسرة للعائلات مع خدمات متكاملة',
            price: 1200,
            duration_days: 4,
            is_featured: true,
            status: 'active',
            start_location: 'الدمام',
            end_location: 'مكة المكرمة',
            office: {
              id: 3,
              office_name: 'مكتب الأنوار للعمرة',
              rating: 4.3,
              services_offered: 'نقل، إقامة، إرشاد'
            },
            images: [
              {
                id: 3,
                image: '/images/package-placeholder.jpg',
                is_featured: true
              }
            ]
          }
        ],
        total: 3,
        per_page: 10,
        current_page: 1
      };
    
    default:
      return null;
  }
} 