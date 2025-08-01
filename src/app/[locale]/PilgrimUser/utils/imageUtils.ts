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
  
  // Get the storage URL from environment variable or use a default
  const storageUrl = process.env.NEXT_PUBLIC_API_STORAGE_URL || 'https://admin.umrahgo.net/storage/';
  
  // Clean up the path to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  // If the path already includes 'storage', don't add it again
  if (cleanPath.includes('storage/')) {
    return `${API_BASE_URL}/${cleanPath}`;
  }
  
  // Return the complete URL
  return `${storageUrl}${cleanPath}`;
}; 