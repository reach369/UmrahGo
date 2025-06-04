import { z } from 'zod';

// Form validation schema for office creation/update
export const OfficeFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  licenseNumber: z.string().min(5, { message: 'License number is required' }),
  location: z.string().min(2, { message: 'Location is required' }),
  address: z.string().min(5, { message: 'Address is required' }),
  contactPerson: z.string().min(2, { message: 'Contact person name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 characters' }),
  website: z.string().url({ message: 'Invalid website URL' }).optional().or(z.literal('')),
  availableSeats: z.coerce.number().int().min(0, { message: 'Available seats must be 0 or higher' }),
  description: z.string().min(10, { message: 'Description should be at least 10 characters' }),
});

// Form validation schema for package creation/update
export const PackageFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description should be at least 10 characters' }),
  duration: z.coerce.number().int().positive({ message: 'Duration must be a positive number' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number' }),
  includes: z.array(z.string()).min(1, { message: 'At least one inclusion is required' }),
  accommodationLevel: z.string().min(2, { message: 'Accommodation level is required' }),
  transportation: z.string().min(2, { message: 'Transportation info is required' }),
  meals: z.string().min(2, { message: 'Meals information is required' }),
  maxPersons: z.coerce.number().int().positive({ message: 'Maximum persons must be a positive number' }),
});

// Form validation schema for registration
export const RegisterFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string(),
  role: z.enum(['user', 'office_manager']).default('user'),
  officeId: z.string().optional().or(z.literal('')),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
.refine(data => !(data.role === 'office_manager' && !data.officeId), {
  message: 'Office ID is required for office managers',
  path: ['officeId'],
});

// Form validation schema for login
export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Form validation schema for search
export const SearchFormSchema = z.object({
  query: z.string().min(1, { message: 'Search query is required' }),
  location: z.string().optional().or(z.literal('')),
  verifiedOnly: z.boolean().default(false),
});

// Utility function to validate form data
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: Record<string, string>; 
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod error format to simple key-value error messages
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { form: 'Invalid form data' } };
  }
} 