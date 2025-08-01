import axios from 'axios';
import { API_BASE_CONFIG, PUBLIC_ENDPOINTS, getImageUrl } from '@/config/api.config';

export interface Office {
    id: number;
    office_name: string;
    logo?: string;
    address?: string;
    contact_number?: string;
    email?: string;
    website?: string;
}

export interface Hotel {
    id: number;
    name: string;
    address: string;
    rating: number;
    // Add other hotel properties as needed
}

export interface PackageImage {
    id: number;
    url: string;
    alt_text?: string;
}

export interface LocationCoordinates {
    location: string;
}

export interface PackageReview {
    id: number;
    user_id?: number;
    user_name?: string;
    rating: number;
    comment: string;
    created_at: string;
    updated_at?: string;
}

export interface Package {
    rating: number;
    id: string | number;
    name: string;
    description?: string;
    price?: number;
    discount_price?: number;
    has_discount?: boolean;
    duration_days?: number;
    features?: any; // Can be an object or a stringified JSON
    status?: string;
    is_featured?: boolean;
    max_persons?: number;
    includes_transport?: boolean;
    includes_accommodation?: boolean;
    includes_meals?: boolean;
    includes_guide?: boolean;
    includes_insurance?: boolean;
    includes_activities?: boolean;
    start_date?: string | null;
    end_date?: string | null;
    start_location?: string | null;
    end_location?: string | null;
    location_coordinates?: LocationCoordinates;
    office_id?: number;
    office?: Office;
    hotels?: Hotel[];
    images?: PackageImage[];
    featured_image_url?: string;
    thumbnail_url?: string;
    views_count?: number;
    terms_and_conditions?: string;
    cancellation_policy?: string;
    type?: string;
    available_seats_count?: number;
    confirmed_bookings_count?: number;
    confirmed_persons_count?: number;
    is_fully_booked?: boolean;
    rating_info?: {
        average_rating: number;
        total_reviews: number;
        rating_breakdown: {
            [key: string]: number;
        };
    };
    reviews?: PackageReview[];
    accommodation_pricing?: {
        [key: string]: {
            key: string;
            name: string;
            type: string;
            price: number;
        }
    };
    formatted_accommodation_pricing?: Array<{
        key: string;
        name: string;
        type: string;
        price: number;
        formatted_price: string;
    }>;
    available_accommodation_types?: Array<{
        key: string;
        name: string;
        type: string;
        price: number;
        formatted_price: string;
    }>;
    google_maps_link?: string;
}

export interface PaginatedPackagesResponse {
    packages: Package[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

const processPackageData = (pkg: any): Package => ({
    ...pkg,
    price: parseFloat(pkg.price),
    featured_image_url: getImageUrl(pkg.featured_image_url),
    office: pkg.office ? {
        ...pkg.office,
        logo: getImageUrl(pkg.office.logo),
    } : undefined,
});

export const fetchPackages = async (filters: any = {}): Promise<PaginatedPackagesResponse> => {
    try {
        const response = await axios.get(`${API_BASE_CONFIG.BASE_URL}${PUBLIC_ENDPOINTS.PACKAGES.LIST}`, { params: filters });
        if (response.data?.status && response.data?.data) {
            const responseData = response.data.data;
            return {
                packages: responseData.data.map(processPackageData),
                pagination: {
                    total: responseData.total,
                    per_page: responseData.per_page,
                    current_page: responseData.current_page,
                    last_page: responseData.last_page,
                },
            };
        }
        return { packages: [], pagination: {} as any };
    } catch (error) {
        console.error('Error fetching packages:', error);
        return { packages: [], pagination: {} as any };
    }
};

export const fetchFeaturedPackages = async (): Promise<Package[]> => {
    try {
        const response = await axios.get(`${API_BASE_CONFIG.BASE_URL}${PUBLIC_ENDPOINTS.PACKAGES.FEATURED}`);
        if (response.data?.status && response.data?.data) {
            return response.data.data.map(processPackageData);
        }
        return [];
    } catch (error) {
        console.error('Error fetching featured packages:', error);
        return [];
    }
}; 