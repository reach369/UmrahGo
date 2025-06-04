import 'next-auth';
import { JWT } from 'next-auth/jwt';

// Extend the built-in session types
declare module 'next-auth' {
  interface User {
    id: number;
    name: string;
    email: string;
    roles: Array<{ name: string }>;
    preferred_language?: string;
    accessToken?: string;
    tokenType?: string;
  }
  
  interface Session {
    accessToken?: string;
    user: {
      id: number;
      name: string;
      email: string;
      roles: Array<{ name: string }>;
      preferred_language?: string;
    } & DefaultSession['user'];
  }
}

// Extend the built-in JWT types
declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    tokenType?: string;
    roles?: Array<{ name: string }>;
    preferred_language?: string;
  }
} 