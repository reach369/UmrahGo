import axios from 'axios';
import { 
  API_BASE_CONFIG, 
  PUBLIC_ENDPOINTS, 
  PROXY_ENDPOINTS,
  getFullUrl,
  getCompleteHeaders,
  getImageUrl,
  getProxyUrl
} from '@/config/api.config';

// Define API response types for settings
export interface SiteSettings {
  // General settings
  site_name: string;
  site_address: string;
  site_email: string;
  site_phone: string;
  
  // Logos and assets
  'general.logo': string;
  'general.logo_dark': string;
  'general.favicon': string;
  
  // Currency
  currency: string;
  currency_symbol: string;
  
  // Languages
  available_languages: string[];
  default_language: string;
  
  // Social media
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_linkedin: string;
  social_whatsapp: string;
  social_youtube: string;
  
  // SEO
  seo_meta_title: string;
  seo_meta_description: string;
  seo_meta_keywords: string;
  
  // All other settings
  [key: string]: any;
}

export interface SettingsResponse {
  status: boolean;
  code: number;
  message: string;
  data: SiteSettings;
}

// Settings service class
class SettingsService {
  private readonly settingsEndpoint = PUBLIC_ENDPOINTS.SETTINGS;
  private cachedSettings: SiteSettings | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes instead of 5
  private fetchPromise: Promise<SiteSettings> | null = null; // Prevent duplicate requests

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    return this.cachedSettings !== null && 
           (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  /**
   * Get site settings from API with caching and deduplication
   */
  async getSettings(): Promise<SiteSettings> {
    // Return cached data if valid
    if (this.isCacheValid()) {
      console.log('Settings service: Using cached settings');
      return this.cachedSettings!;
    }

    // If there's already a fetch in progress, return that promise
    if (this.fetchPromise) {
      console.log('Settings service: Using existing fetch promise');
      return this.fetchPromise;
    }

    // Start new fetch
    this.fetchPromise = this.performFetch();
    
    try {
      const result = await this.fetchPromise;
      return result;
    } finally {
      // Clear the promise after completion
      this.fetchPromise = null;
    }
  }

  /**
   * Perform the actual fetch
   */
  private async performFetch(): Promise<SiteSettings> {
    try {
      console.log('Settings service: Fetching site settings from API...');
      
      const response = await axios.get<SettingsResponse>(
        getFullUrl(this.settingsEndpoint), 
        {
          headers: getCompleteHeaders(),
          timeout: API_BASE_CONFIG.TIMEOUT.DEFAULT,
        }
      );
      
      console.log('Settings service: Successfully fetched settings');
      
      // Cache the settings
      this.cachedSettings = response.data.data;
      this.cacheTimestamp = Date.now();
      
      return this.cachedSettings;
    } catch (error: any) {
      console.error('Settings service: Failed to fetch settings, using fallback data', error.message);
      
      // Return fallback settings and cache them
      const fallbackSettings = this.getFallbackSettings();
      this.cachedSettings = fallbackSettings;
      this.cacheTimestamp = Date.now();
      
      return fallbackSettings;
    }
  }

  /**
   * Get settings with proxy fallback
   */
  async getSettingsWithProxy(): Promise<SiteSettings> {
    // Return cached data if valid
    if (this.isCacheValid()) {
      console.log('Settings service: Using cached settings');
      return this.cachedSettings!;
    }

    try {
      // Try direct API first
      return await this.getSettings();
    } catch (error) {
      console.info('Settings service: Trying proxy fallback...');
      
      try {
        // Try proxy endpoint using config
        const proxyUrl = getProxyUrl('settings');
        const proxyResponse = await axios.get(proxyUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          timeout: API_BASE_CONFIG.TIMEOUT.FAST,
        });
        
        if (proxyResponse.data?.data) {
          console.log('Settings service: Successfully fetched via proxy');
          
          // Cache the settings
          this.cachedSettings = proxyResponse.data.data;
          this.cacheTimestamp = Date.now();
          
          return this.cachedSettings!;
        }
      } catch (proxyError) {
        console.error('Settings service: Proxy also failed', proxyError);
      }
      
      // Final fallback
      const fallbackSettings = this.getFallbackSettings();
      this.cachedSettings = fallbackSettings;
      this.cacheTimestamp = Date.now();
      
      return fallbackSettings;
    }
  }

  /**
   * Clear cache (useful for forcing refresh)
   */
  clearCache(): void {
    this.cachedSettings = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Get logo URL with fallback
   */
  getLogoUrl(settings: SiteSettings, isDark = false): string {
    const logoKey = isDark ? 'general.logo_dark' : 'general.logo';
    const logoPath = settings[logoKey];
    
    if (logoPath) {
      return getImageUrl(logoPath);
    }
    
    // Fallback to local logo
    return isDark ? '/images/logo-dark.png' : '/images/logo.png';
  }

  /**
   * Get favicon URL with fallback
   */
  getFaviconUrl(settings: SiteSettings): string {
    const faviconPath = settings['general.favicon'];
    
    if (faviconPath) {
      return getImageUrl(faviconPath);
    }
    
    return '/favicon.ico';
  }

  /**
   * Get social media links
   */
  getSocialMediaLinks(settings: SiteSettings) {
    return {
      facebook: settings.social_facebook || settings['social.facebook_url'] || '',
      twitter: settings.social_twitter || settings['social.twitter_url'] || '',
      instagram: settings.social_instagram || settings['social.instagram_url'] || '',
      linkedin: settings.social_linkedin || settings['social.linkedin_url'] || '',
      youtube: settings.social_youtube || settings['social.youtube_url'] || '',
      whatsapp: settings.social_whatsapp || '',
    };
  }

  /**
   * Fallback settings when API is unavailable
   */
  getFallbackSettings(): SiteSettings {
    return {
      site_name: 'عمرة قو ',
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
  }
}

export const settingsService = new SettingsService(); 