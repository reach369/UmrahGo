// Type for Next.js params
export type NextParams = Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };

// Utility function to safely access params
export function useParams<T = { [key: string]: string | string[] | undefined }>(params: NextParams): T {
  // Since we can't use React.use() safely, we'll just handle the non-Promise case
  // For Promise cases, this should be handled by the caller with async/await
  if (params && typeof params === 'object' && !('then' in params)) {
    return params as T;
  }
  
  // Return empty object as fallback
  return {} as T;
}

// Helper function to get locale from params with fallback
export function getLocaleFromParams(params: NextParams, fallback: string = 'ar'): string {
  if (!params) return fallback;
  
  // Handle both Promise and direct object cases
  if (typeof params === 'object' && !('then' in params)) {
    return (params as any)?.locale || fallback;
  }
  
  return fallback;
}

// Helper function to get id from params
export function getIdFromParams(params: NextParams): string | undefined {
  if (!params) return undefined;
  
  // Handle both Promise and direct object cases
  if (typeof params === 'object' && !('then' in params)) {
    return (params as any)?.id;
  }
  
  return undefined;
}

// Helper function to get both locale and id from params
export function getLocaleAndIdFromParams(params: NextParams, fallbackLocale: string = 'ar'): { locale: string; id?: string } {
  if (!params) return { locale: fallbackLocale };
  
  // Handle both Promise and direct object cases
  if (typeof params === 'object' && !('then' in params)) {
    return {
      locale: (params as any)?.locale || fallbackLocale,
      id: (params as any)?.id
    };
  }
  
  return { locale: fallbackLocale };
} 