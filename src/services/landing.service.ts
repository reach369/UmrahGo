import axios, { AxiosError } from 'axios';
import { 
  API_BASE_CONFIG, 
  PUBLIC_ENDPOINTS,
  PROXY_ENDPOINTS,
  getFullUrl,
  getCompleteHeaders,
  getProxyUrl,
  getImageUrl
} from '@/config/api.config';

// Define API response types
export interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  location: string;
  rating: number;
  imageUrl: string;
  amenities: string[];
  featured?: boolean;
  
  // API response fields
  name?: string;
  duration_days?: number;
  start_location?: string;
  end_location?: string;
  office?: {
    id?: number;
    office_name?: string;
    rating?: number;
    services_offered?: string;
  };
  images?: Array<{
    id: number;
    image: string | null;
    is_featured?: boolean;
  }>;
  is_featured?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  content?: string;
  rating: number;
  location: string;
  date: string;
  avatarUrl?: string;
  avatar?: string;
  position?: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface HowItWorksStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface Office {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  imageUrl: string;
  featuredPackages: Package[];
  
  // API response fields
  user_id?: number;
  office_name?: string;
  license_number?: string | null;
  services_offered?: string | null;
  address?: string;
  city?: string | null;
  country?: string | null;
  logo?: string | null;
  cover_image?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  website?: string | null;
  social_media?: string | null;
  reviews_count?: number;
  is_featured?: boolean;
  verification_status?: string;
  gallery?: Array<{
    id: number;
    image: string | null;
    is_featured?: boolean;
    description?: string;
    display_order?: number;
    created_at?: string;
    updated_at?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  status: boolean;
  code: number;
  message: string;
  data: T;
}

// Add contact form types
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ContactData {
  address: string;
  phone: string;
  email: string;
  officeHours: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
}

// Create axios instance with retry functionality
const createApiInstance = () => {
  const instance = axios.create({
    timeout: API_BASE_CONFIG.TIMEOUT.DEFAULT,
    headers: API_BASE_CONFIG.DEFAULT_HEADERS,
  });

  // Add request interceptor for retries
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as any;
      
      if (!config || config.retryCount >= 2) {
        throw error;
      }

      config.retryCount = (config.retryCount || 0) + 1;
      
      // Try fallback URLs if main URL fails
      if (config.retryCount === 1 && API_BASE_CONFIG.FALLBACK_URLS.length > 0) {
        const fallbackUrl = API_BASE_CONFIG.FALLBACK_URLS[0];
        config.baseURL = fallbackUrl;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * config.retryCount));
      
      return instance.request(config);
    }
  );

  return instance;
};

const apiInstance = createApiInstance();

// Error handler
const handleError = (error: any, defaultMessage: string = 'حدث خطأ أثناء جلب البيانات') => {
  console.error('API Error:', error);
  
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  
  if (error.message) {
    throw new Error(error.message);
  }
  
  throw new Error(defaultMessage);
};

// Fallback data for when API fails
const getFallbackFeatures = (): Feature[] => [
  {
    id: '1',
    title: 'خدمة عملاء متميزة',
    description: 'فريق دعم متاح 24/7 لمساعدتك في جميع احتياجاتك',
    icon: 'support'
  },
  {
    id: '2',
    title: 'أسعار تنافسية',
    description: 'أفضل الأسعار في السوق مع ضمان الجودة',
    icon: 'price'
  },
  {
    id: '3',
    title: 'مكاتب معتمدة',
    description: 'جميع المكاتب مرخصة ومعتمدة من الجهات المختصة',
    icon: 'verified'
  }
];

const getFallbackTestimonials = (): Testimonial[] => [
  {
    id: '1',
    name: 'أحمد محمد',
    text: 'تجربة رائعة مع UmrahGo، خدمة ممتازة وأسعار مناسبة',
    rating: 5,
    location: 'الرياض، السعودية',
    date: '2023-05-15',
    avatarUrl: '/images/avatar-1.jpg'
  },
  {
    id: '2',
    name: 'فاطمة علي',
    text: 'حجزت عمرة لعائلتي والتنظيم كان مثالي، أنصح بهم بشدة',
    rating: 5,
    location: 'جدة، السعودية',
    date: '2023-04-22',
    avatarUrl: '/images/avatar-2.jpg'
  }
];

const getFallbackHowItWorks = (): HowItWorksStep[] => [
  {
    id: 1,
    title: 'howItWorks.process.steps.1.title',
    description: 'howItWorks.process.steps.1.description',
    icon: 'search',
    order: 1
  },
  {
    id: 2,
    title: 'howItWorks.process.steps.2.title',
    description: 'howItWorks.process.steps.2.description',
    icon: 'check-circle',
    order: 2
  },
  {
    id: 3,
    title: 'howItWorks.process.steps.3.title',
    description: 'howItWorks.process.steps.3.description',
    icon: 'credit-card',
    order: 3
  },
  {
    id: 4,
    title: 'howItWorks.process.steps.4.title',
    description: 'howItWorks.process.steps.4.description',
    icon: 'mail',
    order: 4
  },
  {
    id: 5,
    title: 'howItWorks.process.steps.5.title',
    description: 'howItWorks.process.steps.5.description',
    icon: 'calendar',
    order: 5
  },
  {
    id: 6,
    title: 'howItWorks.process.steps.6.title',
    description: 'howItWorks.process.steps.6.description',
    icon: 'heart',
    order: 6
  }
];

// Landing page service functions
class LandingService {
  // Home page
  async getHomeData() {
    try {
      const response = await apiInstance.get(PUBLIC_ENDPOINTS.HOME);
      return response.data;
    } catch (error) {
      console.info('Home API failed, using sample data:', error);
      return this.getSampleHomeData();
    }
  }

  // Features
  async getFeatures(): Promise<Feature[]> {
    try {
      const response = await apiInstance.get<ApiResponse<Feature[]>>(
        `${API_BASE_CONFIG.BASE_URL}${PUBLIC_ENDPOINTS.FEATURES}`
      );
      
      if (response.data?.status && response.data?.data) {
        return response.data.data;
      }
      
      console.warn('Features API returned invalid response, using fallback');
      return getFallbackFeatures();
    } catch (error) {
      console.warn('Features API failed, using fallback data:', error);
      return getFallbackFeatures();
    }
  }

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const response = await apiInstance.get<ApiResponse<Testimonial[]>>(
        `${API_BASE_CONFIG.BASE_URL}${PUBLIC_ENDPOINTS.TESTIMONIALS}`
      );
      
      if (response.data?.status && response.data?.data) {
        return response.data.data;
      }
      
      console.warn('Testimonials API returned invalid response, using fallback');
      return getFallbackTestimonials();
    } catch (error) {
      console.warn('Testimonials API failed, using fallback data:', error);
      return getFallbackTestimonials();
    }
  }

  // Featured packages
  async getFeaturedPackages(): Promise<Package[]> {
    try {
      const response = await apiInstance.get<ApiResponse<Package[]>>(
        `${API_BASE_CONFIG.BASE_URL}${PUBLIC_ENDPOINTS.PACKAGES.FEATURED}`
      );
      
      if (response.data?.status && response.data?.data) {
        return response.data.data;
      }
      
      console.warn('Featured packages API returned invalid response');
      return [];
    } catch (error) {
      console.warn('Featured packages API failed:', error);
      return [];
    }
  }

  // How It Works Steps
  async getHowItWorksSteps(): Promise<HowItWorksStep[]> {
    try {
      const response = await apiInstance.get<ApiResponse<HowItWorksStep[]>>(
        `${API_BASE_CONFIG.BASE_URL}${PUBLIC_ENDPOINTS.HOW_IT_WORKS}`
      );
      
      if (response.data?.status && response.data?.data) {
        return response.data.data;
      }
      
      console.warn('How it works API returned invalid response, using fallback');
      return getFallbackHowItWorks();
    } catch (error) {
      console.warn('How it works API failed, using fallback data:', error);
      return getFallbackHowItWorks();
    }
  }

  // FAQs
  async getFAQs(): Promise<FAQ[]> {
    try {
      const response = await apiInstance.get(PUBLIC_ENDPOINTS.FAQS);
      return response.data.data || response.data;
    } catch (error) {
      console.info('FAQs API failed, using sample data:', error);
      return this.getSampleFAQs();
    }
  }

  // All packages
  async getAllPackages(params?: Record<string, any>): Promise<Package[]> {
    try {
     

      const response = await apiInstance.get( `${API_BASE_CONFIG.BASE_URL}${PUBLIC_ENDPOINTS.PACKAGES.LIST}`, {
        params: params,
        headers: getCompleteHeaders(),
        timeout: API_BASE_CONFIG.TIMEOUT.FAST,
      });
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        return this.processPackagesData(response.data.data);
      }
      
      return this.getSamplePackages();
    } catch (error) {
      console.info('All packages API failed, using proxy fallback');
      
      try {
        const proxyUrl = getProxyUrl('packages');
        const proxyResponse = await axios.get(proxyUrl, {
          headers: getCompleteHeaders(),
          timeout: API_BASE_CONFIG.TIMEOUT.FAST,
        });
        
        if (proxyResponse.data?.data && Array.isArray(proxyResponse.data.data)) {
          return this.processPackagesData(proxyResponse.data.data);
        }
      } catch (proxyError) {
        console.warn('Packages proxy also failed');
      }
      
      return this.getSamplePackages();
    }
  }

  // Package by ID
  async getPackageById(id: string): Promise<Package> {
    try {
      const response = await apiInstance.get( `${API_BASE_CONFIG.BASE_URL}${PUBLIC_ENDPOINTS.PACKAGES.DETAIL(id)}`, {
        headers: getCompleteHeaders(),
        timeout: API_BASE_CONFIG.TIMEOUT.FAST,
      });
      
      if (response.data?.data) {
        const packageData = response.data.data;
        return this.processPackagesData([packageData])[0];
      }
      
      throw new Error('Package not found');
    } catch (error) {
      console.warn(`Package ${id} not found, returning sample package`);
      return this.getSamplePackages()[0];
    }
  }

  // Search packages
  async searchPackages(query: string): Promise<Package[]> {
    try {
      const response = await apiInstance.get(PUBLIC_ENDPOINTS.PACKAGES.SEARCH, {
        params: { q: query }
      });
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        return this.processPackagesData(response.data.data);
      }
      
      return [];
    } catch (error) {
      console.warn('Search packages failed:', error);
      return [];
    }
  }

  // Offices
  async getOffices(): Promise<Office[]> {
    try {
      const response = await apiInstance.get(PUBLIC_ENDPOINTS.OFFICES.LIST, {
        headers: getCompleteHeaders(),
        timeout: API_BASE_CONFIG.TIMEOUT.FAST,
      });
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        return this.processOfficesData(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        return this.processOfficesData(response.data);
      }
      
      return this.getSampleOffices();
    } catch (error) {
      console.info('Offices API failed, using sample data:', error);
      return this.getSampleOffices();
    }
  }

  // Office by ID
  async getOfficeById(id: string): Promise<Office> {
    try {
      const response = await apiInstance.get(PUBLIC_ENDPOINTS.OFFICES.DETAIL(id), {
        headers: getCompleteHeaders(),
        timeout: API_BASE_CONFIG.TIMEOUT.FAST,
      });
      
      if (response.data?.data) {
        return this.processOfficesData([response.data.data])[0];
      }
      
      throw new Error('Office not found');
    } catch (error) {
      console.warn(`Office ${id} not found, returning sample office`);
      return this.getSampleOffices()[0];
    }
  }

  // Office packages
  async getOfficePackages(officeId: string, params?: Record<string, any>): Promise<Package[]> {
    try {
      const response = await apiInstance.get(PUBLIC_ENDPOINTS.OFFICES.PACKAGES(officeId), {
        params: params,
        headers: getCompleteHeaders(),
        timeout: API_BASE_CONFIG.TIMEOUT.FAST,
      });
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        return this.processPackagesData(response.data.data);
      }
      
      return [];
    } catch (error) {
      console.warn(`Office ${officeId} packages not found`);
      return [];
    }
  }

  // About data
  async getAboutData(): Promise<any> {
    try {
      // You can implement actual API call here in the future
      // For now, return sample data
      return this.getSampleAboutData();
    } catch (error) {
      console.warn('About API failed, using fallback data:', error);
      return this.getSampleAboutData();
    }
  }

  // Contact data retrieval
  async getContactData(): Promise<ContactData> {
    try {
      const response = await apiInstance.get(getProxyUrl('contact'));
      
      if (response.data?.status && response.data?.data) {
        return response.data.data as ContactData;
      }
      
      return this.getSampleContactData();
    } catch (error) {
      console.warn('Error fetching contact data, using fallback:', error);
      return this.getSampleContactData();
    }
  }

  // Contact form submission
  async submitContactForm(formData: ContactFormData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiInstance.post(getProxyUrl('contact-form'), formData);
      
      return {
        success: true,
        message: response.data?.message || 'تم إرسال رسالتك بنجاح'
      };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw new Error((error as any)?.response?.data?.message || 'فشل في إرسال الرسالة، يرجى المحاولة مرة أخرى');
    }
  }

  private processPackagesData(packagesData: any[]): Package[] {
    return packagesData.map((pkg: any) => ({
      id: pkg.id?.toString() || Math.random().toString(),
      title: pkg.name || pkg.title || 'باقة عمرة',
      description: pkg.description || 'وصف الباقة',
      price: pkg.price || 0,
      currency: pkg.currency || 'SAR',
      duration: pkg.duration_days ? `${pkg.duration_days} أيام` : pkg.duration || '7 أيام',
      location: `${pkg.start_location || 'مكة'} - ${pkg.end_location || 'المدينة'}`,
      rating: pkg.office?.rating || pkg.rating || 4.5,
      imageUrl: pkg.images?.find((img: any) => img.is_featured)?.image 
        ? getImageUrl(pkg.images.find((img: any) => img.is_featured).image)
        : '/images/kaaba.jpg',
      amenities: pkg.office?.services_offered 
        ? pkg.office.services_offered.split(',').map((s: string) => s.trim())
        : ['إقامة فندقية', 'وجبات', 'نقل'],
      featured: pkg.is_featured || false,
      ...pkg
    }));
  }

  private processOfficesData(officesData: any[]): Office[] {
    return officesData.map((office: any) => ({
      id: office.id?.toString() || Math.random().toString(),
      name: office.office_name || office.name || 'مكتب العمرة',
      description: office.description || 'مكتب معتمد لخدمات العمرة',
      location: `${office.city || 'مكة'}, ${office.country || 'السعودية'}`,
      rating: office.rating || 4.5,
      imageUrl: office.logo ? getImageUrl(office.logo) : '/images/office-placeholder.jpg',
      featuredPackages: [],
      ...office
    }));
  }

  // Sample data methods
  private getSampleHomeData() {
    return {
      heroTitle: 'تجربة عمرة لا تُنسى',
      heroSubtitle: 'نقدم خدمات العمرة المتكاملة بأعلى معايير الجودة والراحة',
      features: this.getSampleFeatures(),
      testimonials: this.getSampleTestimonials(),
      featuredPackages: this.getSamplePackages().filter(pkg => pkg.featured),
      statistics: [
        { value: 10000, label: 'معتمرين سعداء' },
        { value: 15, label: 'سنوات من الخبرة' },
        { value: 200, label: 'باقة متنوعة' },
        { value: 24, label: 'خدمة على مدار الساعة' }
      ]
    };
  }

  private getSampleFeatures(): Feature[] {
    return [
      {
        id: '1',
        title: 'إقامة فاخرة',
        description: 'نوفر أفضل الفنادق القريبة من الحرمين الشريفين لضمان راحتك',
        icon: 'hotel'
      },
      {
        id: '2',
        title: 'مرشدين متخصصين',
        description: 'مرشدين ذوي خبرة لمساعدتك في أداء مناسك العمرة بسهولة',
        icon: 'user'
      },
      {
        id: '3',
        title: 'مواصلات ميسرة',
        description: 'نقل مريح بين المطار والفندق والحرمين الشريفين',
        icon: 'car'
      },
      {
        id: '4',
        title: 'رعاية متكاملة',
        description: 'خدمات شاملة تغطي جميع احتياجاتك أثناء رحلة العمرة',
        icon: 'shield'
      }
    ];
  }

  private getSampleTestimonials(): Testimonial[] {
    return [
      {
        id: '1',
        name: 'أحمد محمد',
        text: 'تجربة لا تُنسى مع فريق متميز ومحترف. سأنصح جميع أصدقائي بهذه الخدمة الرائعة.',
        rating: 5,
        location: 'الرياض، السعودية',
        date: '2023-05-15',
        avatarUrl: '/images/avatar-1.jpg'
      },
      {
        id: '2',
        name: 'سارة أحمد',
        text: 'كانت رحلة العمرة مع UmrahGo تجربة روحانية مميزة. الخدمات كانت أكثر مما توقعت.',
        rating: 4.5,
        location: 'دبي، الإمارات',
        date: '2023-04-22',
        avatarUrl: '/images/avatar-2.jpg'
      },
      {
        id: '3',
        name: 'خالد العتيبي',
        text: 'سعدت بالتعامل معهم، كل شيء كان منظم بشكل احترافي والإقامة كانت قريبة جدًا من الحرم.',
        rating: 5,
        location: 'جدة، السعودية',
        date: '2023-06-03',
        avatarUrl: '/images/avatar-3.jpg'
      }
    ];
  }

  private getSamplePackages(): Package[] {
    return [
      {
        id: '1',
        title: 'باكج عمرة فاخر - فندق 5 نجوم',
        description: 'استمتع بتجربة عمرة فاخرة مع إقامة في فندق 5 نجوم على بعد خطوات من الحرم المكي.',
        imageUrl: '/images/kaaba.jpg',
        price: 1299,
        currency: 'USD',
        duration: '7 أيام',
        location: 'مكة والمدينة',
        rating: 4.9,
        featured: true,
        amenities: ['إقامة فندقية 5 نجوم', 'وجبات كاملة', 'مرشد ديني', 'نقل من وإلى المطار']
      },
      {
        id: '2',
        title: 'باكج عمرة اقتصادي',
        description: 'باقة اقتصادية مناسبة للميزانيات المحدودة مع الحفاظ على جودة الخدمة.',
        imageUrl: '/images/kaaba.jpg',
        price: 799,
        currency: 'USD',
        duration: '5 أيام',
        location: 'مكة',
        rating: 4.5,
        featured: false,
        amenities: ['إقامة فندقية 3 نجوم', 'وجبتين يوميًا', 'نقل من وإلى المطار']
      }
    ];
  }

  private getSampleHowItWorksSteps(): HowItWorksStep[] {
    return [
      {
        id: 1,
        title: 'howItWorks.process.steps.1.title',
        description: 'howItWorks.process.steps.1.description',
        icon: 'search',
        order: 1
      },
      {
        id: 2,
        title: 'howItWorks.process.steps.2.title',
        description: 'howItWorks.process.steps.2.description',
        icon: 'check-circle',
        order: 2
      },
      {
        id: 3,
        title: 'howItWorks.process.steps.3.title',
        description: 'howItWorks.process.steps.3.description',
        icon: 'credit-card',
        order: 3
      },
      {
        id: 4,
        title: 'howItWorks.process.steps.4.title',
        description: 'howItWorks.process.steps.4.description',
        icon: 'mail',
        order: 4
      },
      {
        id: 5,
        title: 'howItWorks.process.steps.5.title',
        description: 'howItWorks.process.steps.5.description',
        icon: 'calendar',
        order: 5
      },
      {
        id: 6,
        title: 'howItWorks.process.steps.6.title',
        description: 'howItWorks.process.steps.6.description',
        icon: 'heart',
        order: 6
      }
    ];
  }

  private getSampleFAQs(): FAQ[] {
    return [
      {
        id: '1',
        question: 'ما هي المستندات المطلوبة للعمرة؟',
        answer: 'تحتاج إلى جواز سفر ساري المفعول لمدة 6 أشهر على الأقل، وتأشيرة عمرة، وشهادة تطعيم ضد الحمى الصفراء إذا كنت قادمًا من منطقة موبوءة.',
        category: 'المستندات'
      },
      {
        id: '2',
        question: 'كم تستغرق رحلة العمرة؟',
        answer: 'تتراوح مدة رحلة العمرة عادة من 5 إلى 15 يومًا حسب الباقة المختارة والبرنامج المرافق.',
        category: 'البرنامج'
      },
      {
        id: '3',
        question: 'هل يمكنني إلغاء الحجز؟',
        answer: 'نعم، يمكنك إلغاء الحجز وفقًا لشروط وأحكام الإلغاء المحددة في عقد الحجز. قد تطبق رسوم إلغاء حسب توقيت الإلغاء.',
        category: 'الحجز'
      }
    ];
  }

  private getSampleOffices(): Office[] {
    return [
      {
        id: '1',
        name: 'مكتب النور للعمرة',
        description: 'مكتب معتمد متخصص في خدمات العمرة والحج منذ أكثر من 15 عامًا',
        location: 'مكة المكرمة، السعودية',
        rating: 4.8,
        imageUrl: '/images/office-1.jpg',
        featuredPackages: []
      },
      {
        id: '2',
        name: 'مكتب الهدى للحج والعمرة',
        description: 'نقدم خدمات شاملة للعمرة والحج بأعلى معايير الجودة والراحة',
        location: 'المدينة المنورة، السعودية',
        rating: 4.6,
        imageUrl: '/images/office-2.jpg',
        featuredPackages: []
      }
    ];
  }

  private getSampleAboutData(): any {
    return {
      mission: 'نسعى لتوفير تجربة عمرة استثنائية ومتكاملة من خلال ربط المعتمرين بأفضل مكاتب العمرة المعتمدة والموثوقة',
      vision: 'أن نكون المنصة الرائدة والموثوقة في مجال خدمات العمرة، ونساهم في تسهيل رحلة الحج والعمرة لملايين المسلمين حول العالم',
      values: [
        'الثقة والشفافية في جميع خدماتنا ومعاملاتنا',
        'التميز في تقديم خدمة العملاء والدعم الفني',
        'الابتكار في تطوير الحلول التقنية المبتكرة',
        'الجودة في اختيار شركائنا من مكاتب العمرة المعتمدة',
        'المسؤولية الاجتماعية تجاه خدمة المجتمع المسلم'
      ],
      team: [
        {
          id: '1',
          name: 'محمد الأحمد',
          position: 'المدير العام',
          image: '/images/team-1.jpg',
          description: 'خبرة أكثر من 20 عاماً في مجال السياحة الدينية'
        },
        {
          id: '2',
          name: 'فاطمة العلي',
          position: 'مديرة خدمة العملاء',
          image: '/images/team-2.jpg',
          description: 'متخصصة في خدمة العملاء والدعم الفني'
        },
        {
          id: '3',
          name: 'أحمد السالم',
          position: 'مدير العمليات',
          image: '/images/team-3.jpg',
          description: 'خبير في تنظيم الرحلات والعمليات اللوجستية'
        }
      ],
      statistics: [
        { value: 50000, label: 'معتمر سعيد' },
        { value: 20, label: 'سنة خبرة' },
        { value: 100, label: 'مكتب شريك' },
        { value: 500, label: 'باقة متنوعة' }
      ]
    };
  }

  private getSampleContactData(): ContactData {
    return {
      address: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
      phone: '+966 123 456 789',
      email: 'info@umrahgo.com',
      officeHours: 'من الأحد إلى الخميس: 9 صباحًا - 5 مساءً',
      socialMedia: {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com'
      }
    };
  }
}

// Export singleton instance
export const landingService = new LandingService();
export default landingService; 