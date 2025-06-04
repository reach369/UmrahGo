import { API_BASE_URL } from '../services/officesService';

/**
 * Formats image paths from the API into complete URLs
 * @param imagePath - The relative image path from the API
 * @returns Complete URL for the image
 */
export const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return '/images/default-office-cover.png';
  
  // Check if the path is already a complete URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If the path already starts with /storage, don't duplicate it
  if (imagePath.startsWith('/storage/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Handle paths that might be stored in different formats
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Add the API base URL to the path
  return `${API_BASE_URL}/storage/${imagePath}`;
}; 