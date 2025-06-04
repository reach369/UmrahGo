export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://umrahgo.reach369.com',
  API_VERSION: 'v1',
  TIMEOUT: 30000, // 30 seconds
} as const;

// تكوين كامل لعنوان API
export const getApiUrl = (path: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  const version = API_CONFIG.API_VERSION;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/api/${version}/${cleanPath}`;
}; 