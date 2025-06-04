import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          if (response.data?.data) {
            const { user, access_token, token_type } = response.data.data;
            
            // التحقق من أن المستخدم هو مكتب
            const isOffice = user.roles?.some((role: any) => role.name === 'office');
            if (!isOffice) {
              throw new Error('هذا الحساب ليس مكتب عمرة');
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              roles: user.roles,
              preferred_language: user.preferred_language,
              accessToken: access_token,
              tokenType: token_type
            };
          }
          
          throw new Error('فشل تسجيل الدخول');
        } catch (error: any) {
          console.error('Auth error:', error.response?.data || error.message);
          if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
          }
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.tokenType = user.tokenType;
        token.roles = user.roles;
        token.preferred_language = user.preferred_language;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user.roles = token.roles;
        session.user.preferred_language = token.preferred_language;
      }
      return session;
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
});

export { handler as GET, handler as POST }; 