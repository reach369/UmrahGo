'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth.service';
import { UserDetails, User } from '@/types/auth.types';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { getValidImageUrl } from '@/utils/image-helpers';
// import { initializeChatSystem, disconnectChatSystem } from '@/lib/chat-system';

// Auth State
interface AuthState {
  user: UserDetails | null;
  isLoading: boolean;
  error: string | null;
}

// Action types
type AuthAction =
  | { type: 'SET_USER'; payload: UserDetails | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

// Context types
interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'facebook' | 'apple') => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Helper function to convert User to UserDetails
const convertUserToUserDetails = (user: User): UserDetails => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    profile_photo: getValidImageUrl(user.profile_photo) || null,
    avatar: user.avatar || null,
    status: (user.status === 'blocked' ? 'suspended' : user.status) as 'active' | 'pending' | 'suspended',
    is_active: user.is_active !== undefined ? user.is_active : true,
    preferred_language: user.preferred_language || 'ar',
    email_verified_at: user.email_verified_at || null,
    roles: user.roles?.map(role => role.name) || [],
    created_at: user.created_at || '',
    updated_at: user.updated_at || '',
    office: user.umrah_office ? {
      id: user.umrah_office.id,
      office_name: user.umrah_office.office_name,
      address: user.umrah_office.address,
      city: '',  // Default values for required fields
      country: '',
      contact_number: user.umrah_office.contact_number,
      email: '',
      logo: null,
      verification_status: user.umrah_office.verification_status as any,
      license_number: null
    } : undefined
  };
};

// Helper function to save user data to localStorage
const saveUserToLocalStorage = (user: any, token?: string) => {
  if (typeof window === 'undefined') return;
  
  if (user) {
    localStorage.setItem('nextauth_user', JSON.stringify(user));
    
    // If token is provided, save it too
    if (token) {
      localStorage.setItem('nextauth_token', token);
      // Set expiry to 30 days from now
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('nextauth_session_expires', expires);
    }
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { getUserData, isAuthenticated, isHydrated, getUserRole, setUserData, clearStoredSession } = useSessionPersistence();

  // Check authentication status on all pages
  const checkAuth = async () => {
    // Prevent multiple calls
    if (hasCheckedAuth && !state.isLoading) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Wait for hydration
      if (!isHydrated) {
        return;
      }
      
      // First check useSessionPersistence for cached user
      const cachedUser = getUserData();
      
      if (cachedUser && isAuthenticated) {
        dispatch({ type: 'SET_USER', payload: cachedUser as unknown as UserDetails });
        // Ensure the cached user is saved in localStorage
        saveUserToLocalStorage(cachedUser);
        setHasCheckedAuth(true);
        return;
      }
      
      // If no cached data, check with API
      const response = await authService.getCurrentUser();
      
      if (response.data?.user) {
        // Convert User to UserDetails
        const userData = convertUserToUserDetails(response.data.user);
        dispatch({ type: 'SET_USER', payload: userData });
        // Save the user data to localStorage
        saveUserToLocalStorage(userData, (response.data as any).token || '');
        
        // Also save to SessionPersistence
        setUserData(userData, (response.data as any).token || '');
        
        // Initialize chat system if user is authenticated - using dynamic import
        if (isAuthenticated && userData && userData.id) {
          // Use dynamic import to avoid circular dependencies
          try {
            const chatSystem = await import('@/lib/chat-system');
            // Use roles[0] as userType or default to 'pilgrim'
            const userType = userData.roles && userData.roles.length > 0 ? userData.roles[0] : 'pilgrim';
            
            // Initialize chat system with retry for better reliability
            const initializeChatWithRetry = async (retryCount = 0, maxRetries = 3) => {
              try {
                const result = await chatSystem.initializeChatSystem(userData.id, userType);
                if (result) {
                  console.log('Chat system initialized successfully');
                } else if (retryCount < maxRetries) {
                  console.log(`Chat system initialization failed, retrying (${retryCount + 1}/${maxRetries})...`);
                  setTimeout(() => initializeChatWithRetry(retryCount + 1, maxRetries), 2000);
                } else {
                  console.error('Failed to initialize chat system after multiple attempts');
                }
              } catch (error) {
                console.error('Error initializing chat system:', error);
                if (retryCount < maxRetries) {
                  console.log(`Retrying chat initialization (${retryCount + 1}/${maxRetries})...`);
                  setTimeout(() => initializeChatWithRetry(retryCount + 1, maxRetries), 2000);
                }
              }
            };
            
            // Start the initialization process
            initializeChatWithRetry();
          } catch (error) {
            console.error('Error importing chat system:', error);
          }
        }
        
      } else if (state.user) {
        // If we already have user data in state, don't clear it on API failure
        console.warn('API returned no user data, but we have existing user data in state. Keeping existing data.');
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch (error: any) {
      // Don't log "user not logged in" as an error - this is an expected state
      if (error.message !== 'المستخدم غير مسجل الدخول') {
        console.warn('Error checking auth status:', error);
      }
      
      // Don't clear existing user data on API error
      if (!state.user) {
        dispatch({ type: 'SET_USER', payload: null });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      setHasCheckedAuth(true);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.login({ email, password });
      
      if (response.data?.user) {
        // Convert User to UserDetails
        const userData = convertUserToUserDetails(response.data.user);
        dispatch({ type: 'SET_USER', payload: userData });
        
        // Save user data and token to localStorage
        saveUserToLocalStorage(userData, response.data.token);
        
        // Also save to SessionPersistence
        setUserData(userData, response.data.token);
        
        // Initialize chat system with dynamic import to avoid circular dependencies
        try {
          if (typeof window !== 'undefined') {
            const chatSystem = await import('@/lib/chat-system');
            const userType = userData.roles && userData.roles.length > 0 ? userData.roles[0] : 'pilgrim';
            
            // Initialize with retry mechanism
            const initializeChatWithRetry = async (retryCount = 0, maxRetries = 3) => {
              try {
                const result = await chatSystem.initializeChatSystem(userData.id, userType);
                if (result) {
                  console.log('Chat system initialized successfully after login');
                } else if (retryCount < maxRetries) {
                  console.log(`Chat system initialization failed after login, retrying (${retryCount + 1}/${maxRetries})...`);
                  setTimeout(() => initializeChatWithRetry(retryCount + 1, maxRetries), 2000);
                } else {
                  console.error('Failed to initialize chat system after login after multiple attempts');
                }
              } catch (error) {
                console.error('Error initializing chat system after login:', error);
                if (retryCount < maxRetries) {
                  console.log(`Retrying chat initialization after login (${retryCount + 1}/${maxRetries})...`);
                  setTimeout(() => initializeChatWithRetry(retryCount + 1, maxRetries), 2000);
                }
              }
            };
            
            // Start the initialization process
            initializeChatWithRetry();
          }
        } catch (error) {
          console.error('Failed to initialize chat system:', error);
        }
        
        // Redirect user based on role
        const locale = pathname?.split('/')[1] || 'ar';
        const userRole = getUserRole();
        let redirectPath = '';
        
        // Determine redirect path based on role
        switch(userRole) {
          case 'office':
            redirectPath = `/${locale}/umrahoffices/dashboard`;
            break;
          case 'bus_operator':
            redirectPath = `/${locale}/bus-operator`;
            break;
          case 'admin':
            redirectPath = `/${locale}/admin/dashboard`;
            break;
          default:
            redirectPath = `/${locale}/PilgrimUser`;
        }
        
        // Redirect the user
        router.push(redirectPath);
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  // Social login function
  const loginWithProvider = (provider: 'google' | 'facebook' | 'apple') => {
    const url = authService.getSocialLoginUrl(provider);
    window.location.href = url;
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      
      // Disconnect from chat system with dynamic import
      try {
        if (typeof window !== 'undefined') {
          const chatSystem = await import('@/lib/chat-system');
          chatSystem.disconnectChatSystem();
        }
      } catch (error) {
        console.error('Failed to disconnect chat system:', error);
      }
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and cache
      dispatch({ type: 'LOGOUT' });
      clearStoredSession();
      setHasCheckedAuth(false);
      
      // Redirect to login page with correct locale
      const locale = pathname?.split('/')[1] || 'ar';
      router.push(`/${locale}/auth/login`);
    }
  };

  // Check auth on mount for all pages
  useEffect(() => {
    if (!hasCheckedAuth && isHydrated) {
      checkAuth();
    }
  }, [hasCheckedAuth, isHydrated]);

  // Re-check auth when pathname changes, but don't clear existing data
  useEffect(() => {
    if (isHydrated && !state.user) {
      checkAuth();
    }
  }, [pathname, isHydrated]);

  const value: AuthContextType = {
    state,
    dispatch,
    login,
    loginWithProvider,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 