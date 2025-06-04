import { z } from 'zod';
import { apiSlice } from './apiSlice';

// Zod schema for subscription package
export const SubscriptionPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  features: z.array(z.string()),
  isPopular: z.boolean()
});

// Types derived from Zod schema
export type SubscriptionPackage = z.infer<typeof SubscriptionPackageSchema>;
export type SubscriptionPackageList = SubscriptionPackage[];

interface Package {
  id: number;
  office_id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  created_at: string;
}

interface SubscriptionResponse {
  packageId: number;
  officeId: number;
  expiresAt: string;
}

interface SubscribeRequest {
  packageId: number;
  officeId: number;
}

// RTK Query extended API slice for subscription packages
export const subscriptionPackagesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subscription packages
    getSubscriptionPackages: builder.query<Package[], void>({
      query: () => '/subscription-packages',
    }),

    // Get office's current subscription
    getOfficeSubscription: builder.query<SubscriptionResponse, number>({
      query: (officeId) => `/subscriptions/office/${officeId}`,
    }),

    // Subscribe to a package
    subscribeToPackage: builder.mutation<SubscriptionResponse, SubscribeRequest>({
      query: (body) => ({
        url: '/subscriptions',
        method: 'POST',
        body,
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetSubscriptionPackagesQuery,
  useGetOfficeSubscriptionQuery,
  useSubscribeToPackageMutation,
} = subscriptionPackagesApiSlice; 