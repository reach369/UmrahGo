import axios from 'axios';

// Define base URLs to try in order if the main one fails
const API_URLS = [
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1', 
  'https://umrahgo.reach369.com/api/v1',
  // Add more fallbacks as needed
];

// Current API URL index
let currentApiUrlIndex = 0;

// Define the real offices API URL directly
const REAL_OFFICES_API_URL = 'https://umrahgo.reach369.com/api/v1';

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

// Configure axios instance with the current API URL
const createApiInstance = (baseURL: string) => {
  console.log(`Creating API instance with baseURL: ${baseURL}`);
  
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 8000, // Reduced timeout to 8 seconds for faster fallback
  });

  // Add request interceptor for debugging
  api.interceptors.request.use(config => {
    console.log(`API Request to: ${config.baseURL}${config.url}`);
    return config;
  }, error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  });

  // Add response interceptor for debugging and API URL switching
  api.interceptors.response.use(response => {
    console.log(`API Response from: ${response.config.url}`, response.status);
    return response;
  }, async error => {
    console.error('API Response Error:', error.response?.status || 'Unknown', error.message);
    if (error.response) {
      console.error('Error Data:', error.response.data);
    }
    
    // If there was a network or server error, try the next API URL
    if (!error.response || error.response.status >= 500) {
      currentApiUrlIndex = (currentApiUrlIndex + 1) % API_URLS.length;
      console.log(`Switching to next API URL: ${API_URLS[currentApiUrlIndex]}`);
      
      // If we've tried all APIs, reset to the beginning
      if (currentApiUrlIndex === 0) {
        console.error('All API URLs failed, using sample data');
        return Promise.reject(error);
      }
      
      // Create a new request with the new base URL
      const newApi = createApiInstance(API_URLS[currentApiUrlIndex]);
      
      // Retry the request with the new API URL
      try {
        const config = { ...error.config };
        config.baseURL = API_URLS[currentApiUrlIndex];
        return await newApi(config);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }
    
    return Promise.reject(error);
  });

  return api;
};

// Initialize the API with the first URL
let api = createApiInstance(API_URLS[currentApiUrlIndex]);

// Landing page service functions
class LandingService {
  // Home page
  async getHomeData() {
    try {
      // Real API endpoint from documentation
      const response = await api.get('/public/home');
      return response.data;
    } catch (error) {
      console.error('Error fetching home data:', error);
      // Fallback to sample data for demo
      return this.getSampleHomeData();
    }
  }

  async getFeatures(): Promise<Feature[]> {
    try {
      // Real API endpoint from documentation
      const response = await api.get('/public/features');
      return response.data;
    } catch (error) {
      console.error('Error fetching features:', error);
      return this.getSampleFeatures();
    }
  }

  async getTestimonials(): Promise<Testimonial[]> {
    try {
      // Real API endpoint from documentation
      const response = await api.get('/public/testimonials');
      return response.data;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return this.getSampleTestimonials();
    }
  }
  
  async getFeaturedPackages(): Promise<Package[]> {
    try {
      console.log("Fetching featured packages from API...");
      // Try direct URL first for debugging
      const directUrl = `${REAL_OFFICES_API_URL}/public/packages/featured`;
      console.log(`Making direct request to: ${directUrl}`);
      
      // Real API endpoint from documentation
      const response = await api.get(`${REAL_OFFICES_API_URL}/public/packages/featured`);
      console.log("Featured packages response:", response.data);
      
      if (response.data && response.data.data) {
        // Check if data is an array
        const packagesData = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data]; // If it's not an array, wrap it in one
        
        console.log(`Processing ${packagesData.length} featured packages`);
        
        // Skip rest of processing if no packages found
        if (packagesData.length === 0) {
          console.warn("API returned empty featured packages array, using proxy");
          return this.getFeaturedPackagesFromProxy();
        }
        
        return packagesData.map((pkg: any) => ({
          id: pkg && pkg.id ? pkg.id.toString() : Math.random().toString(36).substring(7),
          title: pkg?.name || 'Unnamed Package',
          description: pkg?.description || '',
          price: pkg?.price ? parseFloat(pkg.price) : 0,
          currency: 'SAR',
          duration: pkg?.duration_days ? `${pkg.duration_days} ${pkg.duration_days === 1 ? 'يوم' : 'أيام'}` : '0 أيام',
          location: pkg?.start_location || '',
          rating: pkg?.office?.rating || 4.5,
          imageUrl: pkg?.images?.[0]?.image || '/images/kaaba.jpg',
          amenities: (pkg?.office?.services_offered || '').split('،'),
          featured: pkg?.is_featured || false,
          
          name: pkg?.name,
          duration_days: pkg?.duration_days,
          start_location: pkg?.start_location,
          end_location: pkg?.end_location,
          office: {
            id: pkg?.office?.id,
            office_name: pkg?.office?.office_name,
            rating: pkg?.office?.rating,
            services_offered: pkg?.office?.services_offered,
          },
          images: pkg?.images?.map((img: any) => ({
            id: img?.id,
            image: img?.image,
            is_featured: img?.is_featured,
          })) || [],
          is_featured: pkg?.is_featured,
        }));
      } else {
        console.warn('Unexpected API response format for featured packages:', response.data);
      }
      
      // If we get here, try to use the proxy
      return this.getFeaturedPackagesFromProxy();
    } catch (error) {
      console.error('Error fetching featured packages:', error);
      return this.getFeaturedPackagesFromProxy();
    }
  }

  // Helper method to get featured packages via proxy
  private async getFeaturedPackagesFromProxy(): Promise<Package[]> {
    try {
      console.log("Attempting to fetch featured packages through proxy...");
      // Try the App Router API route first
      const appRouterProxyUrl = '/api/proxy?type=featured-packages';
      console.log(`Making app router proxy request to: ${appRouterProxyUrl}`);
      
      try {
        const response = await axios.get(appRouterProxyUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        console.log("App Router proxy response status:", response.status);
        
        if (response.data && response.data.data) {
          console.log("Successfully retrieved packages from App Router proxy");
          const packagesData = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
          
          // Continue with processing...
          return this.processPackagesData(packagesData);
        }
      } catch (appRouterError) {
        console.error("App Router proxy failed, trying Pages Router proxy:", appRouterError);
      }
      
      // Fall back to Pages Router proxy if App Router fails
      const pagesProxyUrl = '/api/proxy/featured-packages';
      const proxyResponse = await axios.get(pagesProxyUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (proxyResponse.data && proxyResponse.data.data) {
        console.log("Successfully retrieved featured packages through Pages Router proxy");
        
        const packagesData = Array.isArray(proxyResponse.data.data) 
          ? proxyResponse.data.data 
          : [proxyResponse.data.data];
        
        if (packagesData.length === 0) {
          console.warn("Proxy returned empty featured packages array, using sample data");
          return this.getSamplePackages().filter(pkg => pkg.featured);
        }
        
        return this.processPackagesData(packagesData);
      }
    } catch (proxyError) {
      console.error("All proxy attempts for featured packages failed:", proxyError);
    }
    
    // Fallback to sample data
    console.log("Using sample data for featured packages");
    return this.getSamplePackages().filter(pkg => pkg.featured);
  }

  // Helper to process packages data in a consistent way
  private processPackagesData(packagesData: any[]): Package[] {
    return packagesData.map((pkg: any) => ({
      id: pkg.id ? pkg.id.toString() : Math.random().toString(36).substring(7),
      title: pkg.name || pkg.title || 'Unnamed Package',
      description: pkg.description || '',
      price: pkg.price ? parseFloat(pkg.price) : 0,
      currency: 'SAR',
      duration: pkg.duration_days ? `${pkg.duration_days} ${pkg.duration_days === 1 ? 'يوم' : 'أيام'}` : '0 أيام',
      location: pkg.start_location || pkg.location || '',
      rating: pkg.office?.rating || pkg.rating || 4.5,
      imageUrl: pkg.images?.[0]?.image || pkg.images?.[0]?.url || pkg.imageUrl || '/images/kaaba.jpg',
      amenities: (pkg.office?.services_offered || pkg.amenities || '').split('،'),
      featured: pkg.is_featured || pkg.featured || false,
      
      name: pkg.name || pkg.title,
      duration_days: pkg.duration_days,
      start_location: pkg.start_location || pkg.location,
      end_location: pkg.end_location,
      office: {
        id: pkg.office?.id,
        office_name: pkg.office?.office_name || pkg.office?.name,
        rating: pkg.office?.rating || pkg.rating,
        services_offered: pkg.office?.services_offered,
      },
      images: pkg.images?.map((img: any) => ({
        id: img?.id,
        image: img?.image || img?.url,
        is_featured: img?.is_featured,
      })) || [],
      is_featured: pkg.is_featured || pkg.featured,
    }));
  }

  // How it works page
  async getHowItWorksSteps(): Promise<HowItWorksStep[]> {
    try {
      // Real API endpoint from documentation
      const response = await api.get('/public/how-it-works');
      return response.data;
    } catch (error) {
      console.error('Error fetching how it works steps:', error);
      return this.getSampleHowItWorksSteps();
    }
  }

  async getFAQs(): Promise<FAQ[]> {
    try {
      // Real API endpoint from documentation
      const response = await api.get('/public/faqs');
      return response.data;
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return this.getSampleFAQs();
    }
  }

  // Packages page
  async getAllPackages(params?: Record<string, any>): Promise<Package[]> {
    try {
      console.log("Getting all packages with params:", params);
      
      // Create URL with query parameters if provided
      let url = `${REAL_OFFICES_API_URL}/public/packages`;
      if (params && Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      console.log(`Making API request to: ${url}`);
      
      // Try with direct URL for debugging
      const fullUrl = `${API_URLS[currentApiUrlIndex]}${url}`;
      console.log(`Full URL: ${fullUrl}`);
      
      // Make API request
      const response = await api.get(url);
      console.log("Packages response status:", response.status);
      console.log("Packages response type:", typeof response.data);
      
      // Log more details about the response
      if (response.data) {
        console.log("Response has data property");
        if (response.data.data) {
          console.log("Response has data.data property");
          console.log("data.data type:", typeof response.data.data);
          console.log("Is data.data an array?", Array.isArray(response.data.data));
          if (Array.isArray(response.data.data)) {
            console.log("data.data length:", response.data.data.length);
            if (response.data.data.length > 0) {
              console.log("First item sample:", JSON.stringify(response.data.data[0]).substring(0, 200) + "...");
            }
          }
        } else {
          console.log("Response data structure:", Object.keys(response.data));
        }
      }
      
      // Transform API response to match our Package interface
      if (response.data) {
        let packagesData;
        
        // Handle different response formats
        if (response.data.data) {
          // Standard API format with data property
          packagesData = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
        } else if (Array.isArray(response.data)) {
          // Direct array format
          packagesData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          // Object format (maybe single package)
          packagesData = [response.data];
        } else {
          console.warn("Unexpected API response format:", response.data);
          return this.getSamplePackages();
        }
            
        console.log(`Processing ${packagesData.length} packages`);
        
        if (packagesData.length === 0) {
          console.warn("API returned empty packages array, using sample data");
          return this.getSamplePackages();
        }
            
        return packagesData.map((pkg: any) => {
          if (!pkg) {
            console.warn("Found null or undefined package in API response");
            return {
              id: Math.random().toString(36).substring(7),
              title: 'Unnamed Package',
              description: '',
              price: 0,
              currency: 'SAR',
              duration: '0 أيام',
              location: '',
              rating: 0,
              imageUrl: '/images/kaaba.jpg',
              amenities: [],
              featured: false
            };
          }
          
          console.log("Processing package:", pkg.id, pkg.name || pkg.title);
          
          return {
            id: pkg.id ? pkg.id.toString() : Math.random().toString(36).substring(7),
            title: pkg.name || pkg.title || 'Unnamed Package',
            description: pkg.description || '',
            price: pkg.price ? parseFloat(pkg.price) : 0,
            currency: 'SAR',
            duration: pkg.duration_days ? `${pkg.duration_days} ${pkg.duration_days === 1 ? 'يوم' : 'أيام'}` : '0 أيام',
            location: pkg.start_location || pkg.location || '',
            rating: pkg.office?.rating || pkg.rating || 4.5,
            imageUrl: pkg.images?.[0]?.image || pkg.images?.[0]?.url || pkg.imageUrl || '/images/kaaba.jpg',
            amenities: (pkg.office?.services_offered || pkg.amenities || '').split('،'),
            featured: pkg.is_featured || pkg.featured || false,
            
            name: pkg.name || pkg.title,
            duration_days: pkg.duration_days,
            start_location: pkg.start_location || pkg.location,
            end_location: pkg.end_location,
            office: {
              id: pkg.office?.id,
              office_name: pkg.office?.office_name || pkg.office?.name,
              rating: pkg.office?.rating || pkg.rating,
              services_offered: pkg.office?.services_offered,
            },
            images: pkg.images?.map((img: any) => ({
              id: img?.id,
              image: img?.image || img?.url,
              is_featured: img?.is_featured,
            })) || [],
            is_featured: pkg.is_featured || pkg.featured,
          };
        });
      }
      
      console.warn('Unexpected API response format:', response.data);
      return this.getSamplePackages();
    } catch (error) {
      console.error('Error fetching packages:', error);
      
      // Try using a proxy approach if CORS might be an issue
      try {
        console.log("Attempting to fetch packages through a Next.js API route...");
        // This assumes you have a Next.js API route set up to proxy requests
        const proxyUrl = '/api/proxy/packages';
        console.log(`Making proxy request to: ${proxyUrl}`);
        
        const proxyResponse = await axios.get(proxyUrl, { 
          params,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          } 
        });
        
        console.log("Proxy response status:", proxyResponse.status);
        
        if (proxyResponse.data && (proxyResponse.data.data || Array.isArray(proxyResponse.data))) {
          console.log("Successfully retrieved packages through proxy");
          
          // Handle different response formats from proxy
          let packagesData;
          if (proxyResponse.data.data) {
            packagesData = Array.isArray(proxyResponse.data.data) 
              ? proxyResponse.data.data 
              : [proxyResponse.data.data];
          } else if (Array.isArray(proxyResponse.data)) {
            packagesData = proxyResponse.data;
          } else {
            packagesData = [proxyResponse.data];
          }
          
          console.log(`Processing ${packagesData.length} packages from proxy`);
          
          return packagesData.map((pkg: any) => ({
            id: pkg.id ? pkg.id.toString() : Math.random().toString(36).substring(7),
            title: pkg.name || pkg.title || 'Unnamed Package',
            description: pkg.description || '',
            price: pkg.price ? parseFloat(pkg.price) : 0,
            currency: 'SAR',
            duration: pkg.duration_days ? `${pkg.duration_days} ${pkg.duration_days === 1 ? 'يوم' : 'أيام'}` : '0 أيام',
            location: pkg.start_location || pkg.location || '',
            rating: pkg.office?.rating || pkg.rating || 4.5,
            imageUrl: pkg.images?.[0]?.image || pkg.images?.[0]?.url || pkg.imageUrl || '/images/kaaba.jpg',
            amenities: (pkg.office?.services_offered || pkg.amenities || '').split('،'),
            featured: pkg.is_featured || pkg.featured || false,
            
            name: pkg.name || pkg.title,
            duration_days: pkg.duration_days,
            start_location: pkg.start_location || pkg.location,
            end_location: pkg.end_location,
            office: {
              id: pkg.office?.id,
              office_name: pkg.office?.office_name || pkg.office?.name,
              rating: pkg.office?.rating || pkg.rating,
              services_offered: pkg.office?.services_offered,
            },
            images: pkg.images?.map((img: any) => ({
              id: img?.id,
              image: img?.image || img?.url,
              is_featured: img?.is_featured,
            })) || [],
            is_featured: pkg.is_featured || pkg.featured,
          }));
        }
      } catch (proxyError) {
        console.error("Proxy attempt also failed:", proxyError);
      }
      
      return this.getSamplePackages();
    }
  }

  async searchPackagesWithFilters(filters: {
    min_price?: number;
    max_price?: number;
    min_duration?: number;
    max_duration?: number;
    sort?: string;
    per_page?: number;
    page?: number;
    search?: string;
  }): Promise<Package[]> {
    try {
      return this.getAllPackages(filters);
    } catch (error) {
      console.error('Error searching packages with filters:', error);
      // Filter sample packages based on filters (fallback)
      return this.getSamplePackages();
    }
  }

  async getPackageById(id: string): Promise<Package> {
    try {
      // Real API endpoint from documentation
      const response = await api.get(`${REAL_OFFICES_API_URL}/public/packages/${id}`);
      
      // Transform API response to match our Package interface
      if (response.data && response.data.data) {
        const pkg = response.data.data;
        return {
          id: pkg && pkg.id ? pkg.id.toString() : Math.random().toString(36).substring(7),
          title: pkg?.name || 'Unnamed Package',
          description: pkg?.description || '',
          price: pkg?.price ? parseFloat(pkg.price) : 0,
          currency: 'SAR',
          duration: pkg?.duration_days ? `${pkg.duration_days} ${pkg.duration_days === 1 ? 'يوم' : 'أيام'}` : '0 أيام',
          location: pkg?.start_location || '',
          rating: pkg?.office?.rating || 4.5,
          imageUrl: pkg?.images?.[0]?.image || '/images/kaaba.jpg',
          amenities: (pkg?.office?.services_offered || '').split('،'),
          featured: pkg?.is_featured || false,
          name: pkg?.name,
          duration_days: pkg?.duration_days,
          start_location: pkg?.start_location,
          end_location: pkg?.end_location,
          office: {
            id: pkg?.office?.id,
            office_name: pkg?.office?.office_name,
            rating: pkg?.office?.rating,
            services_offered: pkg?.office?.services_offered,
          },
          images: pkg?.images?.map((img: any) => ({
            id: img?.id,
            image: img?.image,
            is_featured: img?.is_featured,
          })) || [],
          is_featured: pkg?.is_featured,
        };
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching package with id ${id}:`, error);
      // For demo, return first sample package or filtered by id if it exists
      const samplePackages = this.getSamplePackages();
      const found = samplePackages.find(pkg => pkg.id === id);
      return found || samplePackages[0];
    }
  }

  async searchPackages(query: string): Promise<Package[]> {
    try {
      // Real API endpoint from documentation
      const response = await api.get(`${REAL_OFFICES_API_URL}/public/packages/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching packages:', error);
      // Filter sample packages based on query
      const samplePackages = this.getSamplePackages();
      return samplePackages.filter(pkg => 
        pkg.title.toLowerCase().includes(query.toLowerCase()) || 
        pkg.description.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  // Offices
  async getOffices(): Promise<Office[]> {
    try {
      console.log("Fetching all offices...");
      
      // Using direct real API URL for reliability
      console.log(`Making direct request to: ${REAL_OFFICES_API_URL}/public/offices`);
      
      // Make API request directly to the real API URL
      const response = await axios.get(`${REAL_OFFICES_API_URL}/public/offices`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 8000,
      });
      
      console.log("Offices response status:", response.status);
      console.log("Offices response type:", typeof response.data);
      
      // Log more details about the response
      if (response.data) {
        console.log("Response has data property");
        if (response.data.data) {
          console.log("Response has data.data property");
          console.log("data.data type:", typeof response.data.data);
          console.log("Is data.data an array?", Array.isArray(response.data.data));
          if (Array.isArray(response.data.data)) {
            console.log("data.data length:", response.data.data.length);
          }
        } else {
          console.log("Response data structure:", Object.keys(response.data));
        }
      }
      
      // Transform API response to match our Office interface
      if (response.data) {
        let officesData;
        
        // Handle different response formats
        if (response.data.data) {
          // Standard API format with data property
          officesData = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
        } else if (Array.isArray(response.data)) {
          // Direct array format
          officesData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          // Object format (maybe single office)
          officesData = [response.data];
        } else {
          console.warn("Unexpected API response format:", response.data);
          return this.getSampleOffices();
        }
        
        console.log(`Processing ${officesData.length} offices`);
        
        if (officesData.length === 0) {
          console.warn("API returned empty offices array, using sample data");
          return this.getSampleOffices();
        }
        
        return this.processOfficesData(officesData);
      }
      
      console.warn('Unexpected API response format:', response.data);
      return this.getSampleOffices();
    } catch (error) {
      console.error('Error fetching offices:', error);
      
      // Try using a proxy approach if CORS might be an issue
      try {
        console.log("Attempting to fetch offices through a Next.js API route...");
        // Use the proxy API route
        const proxyResponse = await axios.get('/api/proxy/offices');
        
        if (proxyResponse.data && (proxyResponse.data.data || Array.isArray(proxyResponse.data))) {
          console.log("Successfully retrieved offices through proxy");
          const officesData = proxyResponse.data.data || proxyResponse.data;
          // Process offices from proxy response
          return this.processOfficesData(officesData);
        }
      } catch (proxyError) {
        console.error("Proxy attempt also failed:", proxyError);
      }
      
      return this.getSampleOffices();
    }
  }

  async getOfficeById(id: string): Promise<Office> {
    try {
      // Using direct real API URL for reliability
      console.log(`Making direct request to: ${REAL_OFFICES_API_URL}/public/offices/${id}`);
      
      // Make API request directly to the real API URL
      const response = await axios.get(`${REAL_OFFICES_API_URL}/public/offices/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 8000,
      });
      
      // Transform API response to match our Office interface
      if (response.data && response.data.data) {
        const office = response.data.data;
        return {
          id: office && office.id ? office.id.toString() : Math.random().toString(36).substring(7),
          name: office?.office_name || 'Unnamed Office',
          description: office?.description || '',
          location: office?.address || (office?.city ? `${office.city}, ${office.country || ''}` : ''),
          rating: office?.rating || 0,
          imageUrl: office?.logo || office?.cover_image || '/images/office-placeholder.jpg',
          featuredPackages: [],  // We'll need to fetch these separately
          
          // Original API fields
          user_id: office?.user_id,
          office_name: office?.office_name,
          license_number: office?.license_number,
          services_offered: office?.services_offered,
          address: office?.address,
          city: office?.city,
          country: office?.country,
          logo: office?.logo,
          cover_image: office?.cover_image,
          contact_email: office?.contact_email,
          contact_phone: office?.contact_phone,
          website: office?.website,
          social_media: office?.social_media,
          reviews_count: office?.reviews_count,
          is_featured: office?.is_featured,
          verification_status: office?.verification_status,
          gallery: office?.gallery,
          created_at: office?.created_at,
          updated_at: office?.updated_at
        };
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching office with id ${id}:`, error);
      const sampleOffices = this.getSampleOffices();
      const found = sampleOffices.find(office => office.id === id);
      return found || sampleOffices[0];
    }
  }

  // Get packages for a specific office
  async getOfficePackages(officeId: string, params?: Record<string, any>): Promise<Package[]> {
    try {
      // Create URL with query parameters if provided
      let url = `/public/offices/${officeId}/packages`;
      if (params && Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      // Using direct real API URL for reliability
      console.log(`Making direct request to: ${REAL_OFFICES_API_URL}${url}`);
      
      // Make API request directly to the real API URL
      const response = await axios.get(`${REAL_OFFICES_API_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 8000,
      });
      
      // Transform API response to match our Package interface
      if (response.data && response.data.data) {
        // Check if data is an array
        const packagesData = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data]; // If it's not an array, wrap it in one
          
        return packagesData.map((pkg: any) => ({
          id: pkg && pkg.id ? pkg.id.toString() : Math.random().toString(36).substring(7),
          title: pkg?.name || 'Unnamed Package',
          description: pkg?.description || '',
          price: pkg?.price ? parseFloat(pkg.price) : 0,
          currency: 'SAR',
          duration: pkg?.duration_days ? `${pkg.duration_days} ${pkg.duration_days === 1 ? 'يوم' : 'أيام'}` : '0 أيام',
          location: pkg?.start_location || '',
          rating: pkg?.office?.rating || 4.5,
          imageUrl: pkg?.images?.[0]?.image || '/images/kaaba.jpg',
          amenities: (pkg?.office?.services_offered || '').split('،'),
          featured: pkg?.is_featured || false,
          
          // Include original API fields
          name: pkg?.name,
          duration_days: pkg?.duration_days,
          start_location: pkg?.start_location,
          end_location: pkg?.end_location,
          office: pkg?.office,
          images: pkg?.images,
          is_featured: pkg?.is_featured
        }));
      }
      
      console.warn('Unexpected API response format:', response.data);
      return [];
    } catch (error) {
      console.error(`Error fetching packages for office ${officeId}:`, error);
      return this.getSamplePackages();
    }
  }

  // About page
  async getAboutData() {
    try {
      // Real API endpoint from documentation
      const response = await api.get(`${REAL_OFFICES_API_URL}/public/about`);
      return response.data;
    } catch (error) {
      console.error('Error fetching about data:', error);
      return {
        title: 'عن UmrahGo',
        description: 'منصة متكاملة تقدم خدمات العمرة بجودة عالية وأسعار منافسة',
        mission: 'تسهيل رحلة العمرة لكل مسلم في أنحاء العالم',
        vision: 'أن نكون الخيار الأول للمعتمرين من جميع أنحاء العالم',
        values: [
          'الجودة العالية',
          'الشفافية',
          'الاحترافية',
          'الالتزام الديني',
          'خدمة العملاء'
        ],
        stats: [
          { value: 10000, label: 'معتمرين سعداء' },
          { value: 15, label: 'سنوات من الخبرة' },
          { value: 200, label: 'باقة متنوعة' }
        ],
        team: [
          {
            name: 'أحمد محمد',
            position: 'المدير التنفيذي',
            bio: 'خبرة 15 عام في مجال السياحة الدينية',
            imageUrl: '/images/team-1.jpg'
          },
          {
            name: 'سارة علي',
            position: 'مدير العمليات',
            bio: 'متخصصة في إدارة العمليات السياحية',
            imageUrl: '/images/team-2.jpg'
          },
          {
            name: 'محمد خالد',
            position: 'مدير خدمة العملاء',
            bio: 'خبرة واسعة في تطوير تجربة العملاء',
            imageUrl: '/images/team-3.jpg'
          }
        ]
      };
    }
  }

  // Contact page
  async getContactData() {
    try {
      // Real API endpoint from documentation
      const response = await api.get(`${REAL_OFFICES_API_URL}/public/contact`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact data:', error);
      return {
        address: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
        phone: '+966 123 456 789',
        email: 'info@umrahgo.com',
        socialMedia: {
          facebook: 'https://facebook.com/umrahgo',
          twitter: 'https://twitter.com/umrahgo',
          instagram: 'https://instagram.com/umrahgo'
        },
        officeHours: 'من الأحد إلى الخميس: 9 صباحًا - 5 مساءً'
      };
    }
  }

  // Submit contact form
  async submitContactForm(data: any) {
    try {
      // Real API endpoint from documentation
        const response = await api.post(`${REAL_OFFICES_API_URL}/public/contact`, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw new Error('Failed to submit contact form');
    }
  }

  // Sample data for fallback/demo purposes
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
        description: 'استمتع بتجربة عمرة فاخرة مع إقامة في فندق 5 نجوم على بعد خطوات من الحرم المكي. تشمل الباقة خدمات متميزة ومرشد ديني خاص طوال فترة الإقامة.',
        imageUrl: '/images/kaaba.jpg',
        price: 1299,
        currency: 'USD',
        duration: '7 أيام',
        location: 'مكة والمدينة',
        rating: 4.9,
        featured: true,
        amenities: ['إقامة فندقية 5 نجوم', 'وجبات كاملة', 'مرشد ديني', 'نقل من وإلى المطار'],
        name: 'باكج عمرة فاخر - فندق 5 نجوم',
        duration_days: 7,
        start_location: 'مكة والمدينة',
        end_location: 'مكة والمدينة',
        office: {
          id: 1,
          office_name: 'مكتب النور للعمرة',
          rating: 4.8,
          services_offered: 'إقامة فندقية 5 نجوم, وجبات كاملة, مرشد ديني, نقل من وإلى المطار',
        },
        images: [
          {
            id: 1,
            image: '/images/kaaba.jpg',
            is_featured: true,
          },
          {
            id: 2,
            image: '/images/kaaba.jpg',
            is_featured: false,
          },
        ],
        is_featured: true,
      },
      {
        id: '2',
        title: 'باكج عمرة اقتصادي',
        description: 'باقة اقتصادية مناسبة للميزانيات المحدودة مع الحفاظ على جودة الخدمة. إقامة مريحة في فندق 3 نجوم مع جميع الخدمات الأساسية.',
        imageUrl: '/images/kaaba.jpg',
        price: 799,
        currency: 'USD',
        duration: '5 أيام',
        location: 'مكة والمدينة',
        rating: 4.5,
        amenities: ['إقامة فندقية 3 نجوم', 'وجبة إفطار', 'نقل من وإلى المطار'],
        name: 'باكج عمرة اقتصادي',
        duration_days: 5,
        start_location: 'مكة والمدينة',
        end_location: 'مكة والمدينة',
        office: {
          id: 1,
          office_name: 'مكتب النور للعمرة',
          rating: 4.8,
          services_offered: 'إقامة فندقية 3 نجوم, وجبة إفطار, نقل من وإلى المطار',
        },
        images: [
          {
            id: 1,
            image: '/images/kaaba.jpg',
            is_featured: false,
          },
          {
            id: 2,
            image: '/images/kaaba.jpg',
            is_featured: false,
          },
        ],
        is_featured: false,
      },
      {
        id: '3',
        title: 'باكج عمرة عائلي',
        description: 'باقة مصممة خصيصًا للعائلات، توفر الراحة والخصوصية مع أنشطة تناسب جميع أفراد العائلة. غرف واسعة وخدمات إضافية للأطفال.',
        imageUrl: '/images/kaaba.jpg',
        price: 999,
        currency: 'USD',
        duration: '10 أيام',
        location: 'مكة والمدينة',
        rating: 4.7,
        amenities: ['إقامة فندقية 4 نجوم', 'وجبات كاملة', 'أنشطة عائلية', 'نقل من وإلى المطار'],
        name: 'باكج عمرة عائلي',
        duration_days: 10,
        start_location: 'مكة والمدينة',
        end_location: 'مكة والمدينة',
        office: {
          id: 2,
          office_name: 'مكتب الإيمان للسياحة الدينية',
          rating: 4.6,
          services_offered: 'إقامة فندقية 4 نجوم, وجبات كاملة, أنشطة عائلية, نقل من وإلى المطار',
        },
        images: [
          {
            id: 1,
            image: '/images/kaaba.jpg',
            is_featured: false,
          },
          {
            id: 2,
            image: '/images/kaaba.jpg',
            is_featured: false,
          },
        ],
        is_featured: false,
      },
      {
        id: '4',
        title: 'باكج عمرة VIP',
        description: 'تجربة عمرة فاخرة بامتياز مع خدمات شخصية متكاملة. إقامة في أفضل الفنادق، مرشد خاص، وزيارات للمعالم التاريخية في مكة والمدينة.',
        imageUrl: '/images/kaaba.jpg',
        price: 1999,
        currency: 'USD',
        duration: '12 أيام',
        location: 'مكة والمدينة',
        rating: 5.0,
        featured: true,
        amenities: ['إقامة فندقية 5 نجوم ديلوكس', 'وجبات فاخرة', 'مرشد خاص', 'نقل خاص', 'زيارة للمعالم'],
        name: 'باكج عمرة VIP',
        duration_days: 12,
        start_location: 'مكة والمدينة',
        end_location: 'مكة والمدينة',
        office: {
          id: 1,
          office_name: 'مكتب النور للعمرة',
          rating: 4.8,
          services_offered: 'إقامة فندقية 5 نجوم ديلوكس, وجبات فاخرة, مرشد خاص, نقل خاص, زيارة للمعالم',
        },
        images: [
          {
            id: 1,
            image: '/images/kaaba.jpg',
            is_featured: true,
          },
          {
            id: 2,
            image: '/images/kaaba.jpg',
            is_featured: false,
          },
        ],
        is_featured: true,
      },
      {
        id: '5',
        title: 'باكج عمرة رمضان',
        description: 'باقة خاصة لشهر رمضان المبارك، توفر تجربة روحانية فريدة خلال الشهر الكريم. إقامة قريبة من الحرم لأداء صلاة التراويح والقيام.',
        imageUrl: '/images/kaaba.jpg',
        price: 1499,
        currency: 'USD',
        duration: '14 أيام',
        location: 'مكة والمدينة',
        rating: 4.8,
        amenities: ['إقامة فندقية 4 نجوم', 'وجبات إفطار وسحور', 'مرشد ديني', 'نقل من وإلى المطار'],
        name: 'باكج عمرة رمضان',
        duration_days: 14,
        start_location: 'مكة والمدينة',
        end_location: 'مكة والمدينة',
        office: {
          id: 2,
          office_name: 'مكتب الإيمان للسياحة الدينية',
          rating: 4.6,
          services_offered: 'إقامة فندقية 4 نجوم, وجبات إفطار وسحور, مرشد ديني, نقل من وإلى المطار',
        },
        images: [
          {
            id: 1,
            image: '/images/kaaba.jpg',
            is_featured: false,
          },
          {
            id: 2,
            image: '/images/kaaba.jpg',
            is_featured: false,
          },
        ],
        is_featured: false,
      },
      {
        id: '6',
        title: 'باكج عمرة الخريف',
        description: 'استمتع بأداء العمرة في أجواء معتدلة خلال فصل الخريف. باقة متكاملة بأسعار تنافسية مع جميع الخدمات الأساسية.',
        imageUrl: '/images/kaaba.jpg',
        price: 899,
        currency: 'USD',
        duration: '7 أيام',
        location: 'مكة والمدينة',
        rating: 4.6,
        amenities: ['إقامة فندقية 4 نجوم', 'وجبات كاملة', 'نقل من وإلى المطار'],
        name: 'باكج عمرة الخريف',
        duration_days: 7,
        start_location: 'مكة والمدينة',
        end_location: 'مكة والمدينة',
        office: {
          id: 2,
          office_name: 'مكتب الإيمان للسياحة الدينية',
          rating: 4.6,
          services_offered: 'إقامة فندقية 4 نجوم, وجبات كاملة, نقل من وإلى المطار',
        },
        images: [
          {
            id: 1,
            image: '/images/kaaba.jpg',
            is_featured: false,
          },
          {
            id: 2,
            image: '/images/kaaba.jpg',
            is_featured: false,
          },
        ],
        is_featured: false,
      }
    ];
  }

  private getSampleHowItWorksSteps(): HowItWorksStep[] {
    return [
      {
        id: 1,
        title: 'اختر الباقة المناسبة',
        description: 'تصفح مجموعة متنوعة من باقات العمرة واختر ما يناسب احتياجاتك وميزانيتك',
        icon: 'package',
        order: 1
      },
      {
        id: 2,
        title: 'أكمل الحجز',
        description: 'قم بملء بياناتك الشخصية ومتطلبات السفر وأكمل الدفع بطريقة آمنة',
        icon: 'credit-card',
        order: 2
      },
      {
        id: 3,
        title: 'استلم التأكيد',
        description: 'ستصلك رسالة تأكيد الحجز مع جميع التفاصيل وتعليمات ما قبل السفر',
        icon: 'check-circle',
        order: 3
      },
      {
        id: 4,
        title: 'استمتع برحلتك',
        description: 'سيستقبلك فريقنا في المطار ويرافقك طوال رحلة العمرة لضمان تجربة لا تُنسى',
        icon: 'heart',
        order: 4
      }
    ];
  }

  private getSampleFAQs(): FAQ[] {
    return [
      {
        id: '1',
        question: 'ما هي المستندات المطلوبة للعمرة؟',
        answer: 'تحتاج إلى جواز سفر ساري المفعول لمدة 6 أشهر على الأقل، تأشيرة عمرة، صور شخصية، وشهادة التطعيم ضد فيروس كورونا والأمراض الأخرى المطلوبة.',
        category: 'السفر والتأشيرات'
      },
      {
        id: '2',
        question: 'كيف يمكنني حجز باقة العمرة؟',
        answer: 'يمكنك حجز باقة العمرة من خلال موقعنا الإلكتروني باختيار الباقة المناسبة، وملء نموذج الحجز، ثم إكمال عملية الدفع الآمن.',
        category: 'الحجز والدفع'
      },
      {
        id: '3',
        question: 'هل أحتاج إلى تأمين سفر؟',
        answer: 'نعم، ننصح بشدة بالحصول على تأمين سفر يغطي الرعاية الصحية والحوادث وإلغاء الرحلة. نوفر خيارات تأمين مع معظم باقاتنا.',
        category: 'السفر والتأشيرات'
      },
      {
        id: '4',
        question: 'هل الوجبات مشمولة في الباقة؟',
        answer: 'تختلف الوجبات المشمولة حسب الباقة المختارة. بعض الباقات تشمل وجبات كاملة، وبعضها يشمل الإفطار فقط. يمكنك الاطلاع على تفاصيل كل باقة لمعرفة الوجبات المشمولة.',
        category: 'الإقامة والخدمات'
      },
      {
        id: '5',
        question: 'ماذا عن النقل من وإلى المطار؟',
        answer: 'جميع باقاتنا تشمل خدمة النقل من وإلى المطار، بالإضافة إلى النقل بين الفنادق في مكة والمدينة وأماكن أداء المناسك.',
        category: 'النقل والمواصلات'
      },
      {
        id: '6',
        question: 'هل يمكنني إلغاء حجزي واسترداد المبلغ؟',
        answer: 'نعم، يمكن إلغاء الحجز واسترداد المبلغ وفق سياسة الإلغاء. الإلغاء قبل 30 يومًا من تاريخ السفر يستحق استرداد كامل، وقبل 15 يومًا يستحق استرداد 50%، وأقل من ذلك لا يستحق أي استرداد.',
        category: 'الحجز والدفع'
      }
    ];
  }

  private getSampleOffices(): Office[] {
    return [
      {
        id: '1',
        name: 'مكتب النور للعمرة',
        description: 'مكتب متخصص في خدمات العمرة بخبرة 15 عامًا، نقدم خدمات متكاملة بأعلى معايير الجودة.',
        location: 'مكة المكرمة، السعودية',
        rating: 4.8,
        imageUrl: '/images/office-1.jpg',
        featuredPackages: this.getSamplePackages().slice(0, 2)
      },
      {
        id: '2',
        name: 'مكتب الإيمان للسياحة الدينية',
        description: 'نوفر باقات عمرة متنوعة تناسب جميع الفئات، مع خدمة عملاء متميزة على مدار الساعة.',
        location: 'المدينة المنورة، السعودية',
        rating: 4.6,
        imageUrl: '/images/office-2.jpg',
        featuredPackages: this.getSamplePackages().slice(2, 4)
      },
      {
        id: '3',
        name: 'مكتب البركة للعمرة والحج',
        description: 'مكتب معتمد يقدم خدمات العمرة والحج بأسعار تنافسية مع ضمان الراحة والجودة.',
        location: 'جدة، السعودية',
        rating: 4.7,
        imageUrl: '/images/office-3.jpg',
        featuredPackages: this.getSamplePackages().slice(4, 6)
      }
    ];
  }

  async searchOfficesWithFilters(filters: {
    rating?: number;
    city?: string;
    sort?: string;
    per_page?: number;
    page?: number;
    search?: string;
    is_featured?: boolean;
  }): Promise<Office[]> {
    try {
      console.log("Searching offices with filters:", filters);
      
      // Create URL with query parameters
      let url = '/public/offices';
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      console.log(`Making API request to: ${REAL_OFFICES_API_URL}${url}`);
      
      // Make API request directly to the real API URL
      const response = await axios.get(`${REAL_OFFICES_API_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 8000,
      });
      
      console.log("Received response from real API:", response.status);
      
      // Use the same processing logic as in getOffices
      if (response.data) {
        console.log("Response data:", response.data);
        let officesData;
        
        // Handle different response formats
        if (response.data.data) {
          officesData = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
        } else if (Array.isArray(response.data)) {
          officesData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          officesData = [response.data];
        } else {
          return this.getSampleOffices();
        }
        
        return this.processOfficesData(officesData);
      }
      
      return this.getSampleOffices();
    } catch (error) {
      console.error('Error searching offices with filters:', error);
      // Try the proxy as fallback
      try {
        const proxyResponse = await axios.get('/api/proxy/offices', { params: filters });
        if (proxyResponse.data && proxyResponse.data.data) {
          return proxyResponse.data.data;
        }
      } catch (proxyError) {
        console.error('Proxy fallback failed:', proxyError);
      }
      
      return this.getSampleOffices();
    }
  }

  // Helper to process offices data
  private processOfficesData(officesData: any[]): Office[] {
    return officesData.map((office: any) => ({
      id: office.id ? office.id.toString() : Math.random().toString(36).substring(7),
      name: office.office_name || office.name || 'Unnamed Office',
      description: office.description || '',
      location: office.address || office.location || (office.city ? `${office.city}, ${office.country || ''}` : ''),
      rating: office.rating || 0,
      imageUrl: office.logo || office.cover_image || office.imageUrl || '/images/office-placeholder.jpg',
      featuredPackages: [],
      
      // Include all original API fields for reference
      user_id: office.user_id,
      office_name: office.office_name || office.name,
      license_number: office.license_number,
      services_offered: office.services_offered,
      address: office.address || office.location,
      city: office.city,
      country: office.country,
      logo: office.logo,
      cover_image: office.cover_image || office.imageUrl,
      contact_email: office.contact_email || office.email,
      contact_phone: office.contact_phone || office.phone,
      website: office.website,
      social_media: office.social_media,
      reviews_count: office.reviews_count,
      is_featured: office.is_featured || office.featured,
      verification_status: office.verification_status,
      gallery: office.gallery,
      created_at: office.created_at,
      updated_at: office.updated_at
    }));
  }
}

export const landingService = new LandingService(); 