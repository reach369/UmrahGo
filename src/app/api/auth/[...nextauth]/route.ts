import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1';
          
          const response = await axios.post(`${baseUrl}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (response.data?.status && response.data?.data) {
            const { user, token, token_type } = response.data.data;
            
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              roles: user.roles,
              preferred_language: user.preferred_language,
              accessToken: token,
              tokenType: token_type,
              userType: user.roles?.find((role: any) => ['office', 'user', 'admin', 'pilgrim', 'customer'].includes(role.name))?.name || 'customer'
            };
          }
          
          return null;
        } catch (error: any) {
          console.error('NextAuth credentials login error:', error.response?.data || error.message);
          
          // Format error message from API for better user experience
          let errorMessage = 'فشل تسجيل الدخول';
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.errors) {
            // Join all error messages
            const errorMessages = Object.values(error.response.data.errors).flat();
            errorMessage = errorMessages.join(', ');
          }
          
          throw new Error(errorMessage);
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1';
          
          // Enhanced Google login with more fields and error handling
          const googleAuthPayload = {
            id_token: account.id_token,
            access_token: account.access_token,
            email: profile?.email,
            name: profile?.name,
            google_id: profile?.sub,
            // Add additional data from Google profile if available
            given_name: (profile as any)?.given_name,
            family_name: (profile as any)?.family_name,
            image: (profile as any)?.picture,
            // Add FCM token if available in session or request context
            fcm_token: (user as any)?.fcmToken || null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: (profile as any)?.locale || 'ar'
          };
          
          // Log the request for debugging (remove sensitive data)
          console.log('Sending Google auth request to backend with payload:', {
            email: googleAuthPayload.email,
            name: googleAuthPayload.name,
            has_id_token: !!account.id_token,
            has_access_token: !!account.access_token,
            has_fcm_token: !!googleAuthPayload.fcm_token
          });
          
          // Send request with retry logic for better reliability
          let retries = 3;
          let lastError = null;
          
          while (retries > 0) {
            try {
              const response = await axios.post(`${baseUrl}/auth/social/google`, googleAuthPayload, {
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                timeout: 8000 // 8 second timeout
              });
              
              // Handle success response - check different possible response formats
              if (response.data?.status && response.data?.data) {
                // Main API format
                const { user: apiUser, token, token_type } = response.data.data;
                
                // Enhanced user data mapping
                user.id = apiUser.id.toString();
                user.name = apiUser.name;
                user.email = apiUser.email;
                (user as any).image = apiUser.image || apiUser.profile_photo || (profile as any)?.picture;
                (user as any).accessToken = token;
                (user as any).tokenType = token_type;
                (user as any).roles = apiUser.roles;
                (user as any).preferred_language = apiUser.preferred_language || (profile as any)?.locale || 'ar';
                (user as any).userType = apiUser.roles?.find((role: any) => ['office', 'pilgrim', 'customer'].includes(role.name))?.name || 'customer';
                // Store Firebase UID if returned
                (user as any).firebaseUid = apiUser.firebase_uid || null;
                
                console.log('Google auth successful, user data synchronized');
                return true;
              } else if (response.data?.token) {
                // Alternative API format
                const { user: apiUser, token, token_type } = response.data;
                
                user.id = apiUser.id.toString();
                user.name = apiUser.name;
                user.email = apiUser.email;
                (user as any).image = apiUser.image || apiUser.profile_photo || (profile as any)?.picture;
                (user as any).accessToken = token;
                (user as any).tokenType = token_type || 'Bearer';
                (user as any).roles = apiUser.roles;
                
                console.log('Google auth successful (alt format), user data synchronized');
                return true;
              }
              
              console.error('Google OAuth API error: Invalid response format', response.data);
              return false;
            } catch (error: any) {
              lastError = error;
              console.error('Google OAuth API error:', error.message, error.response?.data);
              retries--;
              
              // Short delay before retry
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log(`Retrying Google auth... (${retries} attempts left)`);
              }
            }
          }
          
          if (lastError) {
            console.error('All Google auth retries failed:', (lastError as any).message);
            
            // Check for specific API error messages
            if ((lastError as any).response?.data?.message) {
              console.error('API Error:', (lastError as any).response.data.message);
            }
            
            // Allow login to proceed for client-side handling if needed
            // This will create a NextAuth session, but the user data might not be synchronized with backend
            return true;
          }
          
          return false;
        } catch (error: any) {
          console.error('Unexpected error in Google sign-in callback:', error.message);
          return false;
        }
      }
      return true;
    },
    async session({ session, token, user }) {
      // Pass token data to the client in session
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
        session.tokenType = (token.tokenType as string) || 'Bearer';
      }
      
      // Pass user roles to the client
      if (token.roles) {
        session.user.roles = token.roles as any[];
      }
      
      // Pass user type to the client
      if (token.userType) {
        session.user.userType = token.userType as string;
      }
      
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.accessToken = (user as any).accessToken;
        token.tokenType = (user as any).tokenType || 'Bearer';
        token.roles = (user as any).roles;
        token.userType = (user as any).userType;
        token.preferred_language = (user as any).preferred_language;
        
        // Store the provider for later use
        if (account) {
          token.provider = account.provider;
        }
      }
      
      return token;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };

