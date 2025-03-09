import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';
import clientPromise from '@/lib/mongo';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      name: 'Epiphany',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          scope: "openid profile email"
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
        console.log('Authorize credentials:', credentials);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing email or password');
          return null;
        }
        
        try {
          const client = await clientPromise;
          const db = client.db("auth");
          const users = db.collection("users");
          
          const user = await users.findOne({ email: credentials.email });
          console.log('Found user:', user);
          
          if (!user) {
            console.log('No user found with this email');
            return null;
          }
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('Password valid:', isValid);
          
          if (!isValid) {
            console.log('Invalid password');
            return null;
          }
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || '',
          };
        } catch (error) {
          console.error('Error in authorize:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      // Ensure user data is consistently available in the session
      session.user = {
        ...session.user,
        id: token.sub as string,
        email: token.email as string,
        name: token.name as string || '',
      };
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Persist the user id to the token
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      if (account?.provider === 'google' && profile) {
        token.sub = profile.sub;
        token.email = profile.email;
        token.name = profile.name;
      }
      
      return token;
    }
  },
  events: {
    async signIn(message) {
      console.log('Sign In Event:', message);
    },
    async signOut(message) {
      console.log('Sign Out Event:', message);
    },
    async createUser(message) {
      console.log('User Created:', message);
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
    signOut: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Add debug mode during development to help troubleshoot
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };