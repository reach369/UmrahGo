import axios from 'axios';
import { API_BASE_CONFIG, PUBLIC_ENDPOINTS, getImageUrl } from '@/config/api.config';
import { Package } from './packages.service';

const processSinglePackageData = (pkg: any): Package => ({
    ...pkg,
    price: parseFloat(pkg.price),
    featured_image_url: getImageUrl(pkg.featured_image_url),
    images: pkg.images?.map((img: any) => ({ ...img, url: getImageUrl(img.image_path) })),
    office: pkg.office ? {
        ...pkg.office,
        logo: getImageUrl(pkg.office.logo),
    } : undefined,
    hotels: pkg.hotels?.map((hotel: any) => ({
        ...hotel,
        featured_image_url: hotel.featured_image_url ? getImageUrl(hotel.featured_image_url) : undefined,
    })),
    // Ensure numeric values are properly parsed
    available_seats_count: parseInt(pkg.available_seats_count || '0', 10),
    confirmed_bookings_count: parseInt(pkg.confirmed_bookings_count || '0', 10),
    confirmed_persons_count: parseInt(pkg.confirmed_persons_count || '0', 10),
    is_fully_booked: pkg.is_fully_booked === true || pkg.is_fully_booked === 'true',
    // Ensure rating info is properly structured
    rating_info: pkg.rating_info || {
        average_rating: 0,
        total_reviews: 0,
        rating_breakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    },
    // Process accommodation pricing
    accommodation_pricing: pkg.accommodation_pricing || {},
    // Format accommodation pricing for display
    formatted_accommodation_pricing: pkg.accommodation_pricing ? 
        Object.entries(pkg.accommodation_pricing).map(([key, option]: [string, any]) => ({
            key,
            ...option,
            formatted_price: `${option.price} ريال`
        })) : [],
    // Make available accommodation types from accommodation pricing
    available_accommodation_types: pkg.accommodation_pricing ? 
        Object.entries(pkg.accommodation_pricing).map(([key, option]: [string, any]) => ({
            key,
            ...option,
            formatted_price: `${option.price} ريال`
        })) : [],
});

export const fetchPackageById = async (id: string | number): Promise<Package | null> => {
    try {
        const response = await axios.get(`${API_BASE_CONFIG.BASE_URL}${PUBLIC_ENDPOINTS.PACKAGES.DETAIL(id)}`);
        if (response.data?.status && response.data?.data) {
            return processSinglePackageData(response.data.data);
        }
        return null;
    } catch (error) {
        console.error(`Error fetching package ${id}:`, error);
        return null;
    }
}; 