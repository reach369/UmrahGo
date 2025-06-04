import axiosInstance from '@/lib/axios';

// Base interface for common fields
interface BaseRegistrationData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
}

// Operator registration data type
export interface OperatorRegistrationData extends BaseRegistrationData {}

// Office registration data type
export interface OfficeRegistrationData extends BaseRegistrationData {
  address: string;
  license_number: string;
  commercial_register: string;
}

// User type enum
export type UserType = 'operator' | 'office';

// Generic registration function
export const register = async <T extends BaseRegistrationData>(
  userType: UserType,
  data: T
) => {
  try {
    const response = await axiosInstance.post(`/auth/register/${userType}`, data);
    console.log(`✅ ${userType.charAt(0).toUpperCase() + userType.slice(1)} Registered:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ ${userType.charAt(0).toUpperCase() + userType.slice(1)} Registration Error:`, {
      status: error?.response?.status,
      message: error?.response?.data?.message,
      errors: error?.response?.data?.errors
    });
    throw error;
  }
};

// Specific registration functions for convenience
export const registerOperator = async (data: OperatorRegistrationData) => {
  return register<OperatorRegistrationData>('operator', data);
};

export const registerOffice = async (data: OfficeRegistrationData) => {
  return register<OfficeRegistrationData>('office', data);
}; 