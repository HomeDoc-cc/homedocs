import 'next-auth';
import { SubscriptionTier } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: 'USER' | 'ADMIN';
      tier?: SubscriptionTier;
    };
  }
}
