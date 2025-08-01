import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { z } from 'zod';

// User schema with Zod for validation
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['user', 'admin', 'office_manager']).default('user'),
  officeId: z.string().optional(), // ID of the managed office, if role is office_manager
  image: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Interface for authentication state
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state with default user for development
const initialState: AuthState = {
  user: {
    id: 'user-admin-1',
    email: 'admin@umrahgo.com',
    name: 'مدير مكتب العمرة',
    role: 'office_manager',
    officeId: 'office-1',
    image: '/placeholder-avatar.jpg'
  },
  token: 'mock-jwt-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

// Create the slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Start loading auth state
    authLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    // Set authenticated user
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    
    // Set token
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    
    // Auth error
    authError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Logout - clear auth state
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

// Export actions and reducer
export const {
  authLoading,
  setUser,
  setToken,
  authError,
  logout,
} = authSlice.actions;

export default authSlice.reducer; 