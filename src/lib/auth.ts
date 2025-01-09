import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { OAuthConfig } from 'next-auth/providers/oauth';
import { z } from 'zod';

import { prisma } from '@/lib/db';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

interface OIDCProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
}

// Build the providers array based on enabled providers
const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials) return null;

      try {
        const { email, password } = credentialsSchema.parse(credentials);

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            isDisabled: true,
          },
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        if (user.isDisabled) {
          throw new Error('Account is disabled');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Get the first validation error message
          const firstError = error.errors[0];
          throw new Error(firstError.message);
        }
        throw error;
      }
    },
  }),
];

// Add OIDC provider if enabled
if (process.env.OIDC_ENABLED === 'true') {
  const oidcProvider = {
    id: 'oidc',
    name: 'OpenID Connect',
    type: 'oauth',
    wellKnown: process.env.OIDC_WELL_KNOWN_URL || undefined,
    clientId: process.env.OIDC_CLIENT_ID || '',
    clientSecret: process.env.OIDC_CLIENT_SECRET || '',
    issuer: process.env.OIDC_ISSUER,
    allowDangerousEmailAccountLinking:
      process.env.NEXTAUTH_ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING === 'true',
    authorization: { params: { scope: 'openid email profile' } },
    idToken: true,
    checks: ['pkce', 'state'],
    async profile(profile: OIDCProfile) {
      // Check if user exists and is disabled
      const user = await prisma.user.findUnique({
        where: { email: profile.email },
        select: { isDisabled: true },
      });

      if (user?.isDisabled) {
        throw new Error('Account is disabled');
      }

      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      };
    },
  } as OAuthConfig<OIDCProfile>;
  providers.push(oidcProvider);
}

// Add Google provider if enabled
if (process.env.GOOGLE_ENABLED === 'true') {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking:
        process.env.NEXTAUTH_ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING === 'true',
      httpOptions: {
        timeout: 10000, // 10 seconds
      },
      async profile(profile) {
        // Check if user exists and is disabled
        const user = await prisma.user.findUnique({
          where: { email: profile.email },
          select: { isDisabled: true },
        });

        if (user?.isDisabled) {
          throw new Error('Account is disabled');
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') return true;

      // For OAuth providers (Google and OIDC)
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: { accounts: true },
      });

      if (!existingUser) return true;

      // If the user exists but has no accounts, allow sign in
      if (existingUser.accounts.length === 0) return true;

      // Check if they're trying to sign in with the same provider
      const hasProvider = existingUser.accounts.some((acc) => acc.provider === account?.provider);

      if (hasProvider) return true;

      const allowDangerousEmailAccountLinking =
        process.env.NEXTAUTH_ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING === 'true';

      if (allowDangerousEmailAccountLinking) {
        return true;
      }

      // If they're trying to use a different provider, but the email exists
      throw new Error(
        'An account with this email already exists. Please sign in with your original authentication method.'
      );
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        // Fetch user role and disabled status
        const user = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: { role: true, isDisabled: true, tier: true },
        });

        // If user is disabled, end their session
        if (user?.isDisabled) {
          throw new Error('Account is disabled');
        }

        session.user.role = user?.role;
        session.user.tier = user?.tier;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      // Add OIDC access token if available
      if (account?.provider === 'oidc' && account.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
};
