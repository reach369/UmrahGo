/**
 * خدمة المصادقة المخصصة للمحادثات
 * Specialized Authentication Service for Chat System
 */

import { getSession } from 'next-auth/react';
import { 
  API_BASE_CONFIG, 
  PUBLIC_ENDPOINTS,
  PROXY_ENDPOINTS,
  getFullUrl,
  getCompleteHeaders,
  getProxyUrl,
  getImageUrl
} from '@/config/api.config';
export interface AuthUserData {
  id: number;
  name: string; 
  email: string;
  avatar?: string;
  userType: 'admin' | 'office' | 'pilgrim' | 'operator';
  token: string;
  isAuthenticated: boolean;
}

class AuthChatService {
  private cachedUser: AuthUserData | null = null;
  private authCheckPromise: Promise<AuthUserData | null> | null = null;

  /**
   * Get current authenticated user with comprehensive checks
   */
  async getCurrentUser(): Promise<AuthUserData | null> {
    // Return cached user if available and still valid
    if (this.cachedUser && this.isTokenValid(this.cachedUser.token)) {
      return this.cachedUser;
    }

    // Use existing promise if one is in progress
    if (this.authCheckPromise) {
      return this.authCheckPromise;
    }

    // Create new auth check promise
    this.authCheckPromise = this.performAuthCheck();
    const result = await this.authCheckPromise;
    this.authCheckPromise = null;

    return result;
  }

  /**
   * Perform comprehensive authentication check
   */
  private async performAuthCheck(): Promise<AuthUserData | null> {
    try {
      // 1. Try NextAuth session first
      const session = await getSession();
      if (session?.user) {
        const token = localStorage.getItem('nextauth_token') || localStorage.getItem('token');
        if (token) {
          const userData: AuthUserData = {
            id: parseInt(session.user.id?.toString() || '0'),
            name: session.user.name || 'مستخدم',
            email: session.user.email || '',
            avatar: session.user.image || undefined,
            userType: this.determineUserType(session.user),
            token,
            isAuthenticated: true,
          };
          
          this.cachedUser = userData;
          return userData;
        }
      }

      // 2. Try token-based authentication
      const token = localStorage.getItem('nextauth_token') || localStorage.getItem('token');
      if (token) {
        const userData = await this.validateTokenAndGetUser(token);
        if (userData) {
          this.cachedUser = userData;
          return userData;
        }
      }

      // 3. Clear cache if no valid authentication found
      this.clearCache();
      return null;

    } catch (error) {
      console.error('Auth check failed:', error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Validate token with backend and get user data
   */
  private async validateTokenAndGetUser(token: string): Promise<AuthUserData | null> {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Token expired or invalid');
          this.clearAuthData();
        }
        return null;
      }

      const data = await response.json();
      if (data.success && data.data) {
        return {
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          avatar: data.data.profile_photo_path || data.data.avatar,
          userType: this.determineUserTypeFromData(data.data),
          token,
          isAuthenticated: true,
        };
      }

      return null;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }

  /**
   * Determine user type from session
   */
  private determineUserType(user: any): AuthUserData['userType'] {
    if (user.role) {
      switch (user.role.toLowerCase()) {
        case 'admin': return 'admin';
        case 'office': return 'office';
        case 'operator': return 'operator';
        case 'pilgrim': return 'pilgrim';
        default: return 'pilgrim';
      }
    }
    
    // Fallback determination based on email or other properties
    if (user.email?.includes('@admin.') || user.email?.includes('@system.')) {
      return 'admin';
    }
    
    return 'pilgrim';
  }

  /**
   * Determine user type from backend data
   */
  private determineUserTypeFromData(userData: any): AuthUserData['userType'] {
    if (userData.roles && Array.isArray(userData.roles)) {
      const roleNames = userData.roles.map((r: any) => r.name || r).join(',').toLowerCase();
      
      if (roleNames.includes('admin')) return 'admin';
      if (roleNames.includes('office')) return 'office';
      if (roleNames.includes('operator')) return 'operator';
    }
    
    if (userData.user_type) {
      return userData.user_type.toLowerCase();
    }
    
    return 'pilgrim';
  }

  /**
   * Check if token is still valid (basic check)
   */
  private isTokenValid(token: string): boolean {
    if (!token) return false;
    
    try {
      // Basic JWT validation (check if it's not expired)
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp ? payload.exp > now : true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear cached authentication data
   */
  clearCache(): void {
    this.cachedUser = null;
    this.authCheckPromise = null;
  }

  /**
   * Clear all authentication data (logout)
   */
  clearAuthData(): void {
    this.clearCache();
    
    // Clear all possible token storage locations
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('nextauth_token');
      localStorage.removeItem('umrah_token');
      sessionStorage.removeItem('token');
    }
  }

  /**
   * Force refresh user data
   */
  async refreshUser(): Promise<AuthUserData | null> {
    this.clearCache();
    return this.getCurrentUser();
  }

  /**
   * Check if user is authenticated (quick check using cache)
   */
  isAuthenticated(): boolean {
    return this.cachedUser?.isAuthenticated || false;
  }

  /**
   * Get user ID (quick access)
   */
  getUserId(): number | null {
    return this.cachedUser?.id || null;
  }

  /**
   * Get auth token (quick access)
   */
  getToken(): string | null {
      return this.cachedUser?.token || localStorage.getItem('nextauth_token') || localStorage.getItem('token');
  }
}

// Export singleton instance
export const authChatService = new AuthChatService();
export default authChatService; 