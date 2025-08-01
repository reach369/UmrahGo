/**
 * Google Maps related types and utilities
 */

/**
 * Represents a geographic location with latitude and longitude
 */
export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

/**
 * Converts a string location "lat,lng" to a MapLocation object
 */
export function parseLocationString(locationString?: string): MapLocation | null {
  if (!locationString) return null;
  
  const parts = locationString.split(',');
  if (parts.length !== 2) return null;
  
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  
  if (isNaN(lat) || isNaN(lng)) return null;
  
  return { lat, lng };
}

/**
 * Converts a MapLocation to a string representation "lat,lng"
 */
export function locationToString(location?: MapLocation | null): string | undefined {
  if (!location) return undefined;
  return `${location.lat},${location.lng}`;
}

/**
 * Calculates distance between two locations in kilometers
 */
export function calculateDistance(point1: MapLocation, point2: MapLocation): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(point2.lat - point1.lat);
  const dLng = deg2rad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2); 
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  
  return distance;
}

/**
 * Converts degrees to radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
} 