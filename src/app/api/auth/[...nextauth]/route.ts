import NextAuth from 'next-auth';

import { authOptions } from '@/lib/auth';

// Using NextAuth's handler directly for App Router
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
