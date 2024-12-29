import NextAuth from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { getRequestContext, logger } from '@/lib/logger';

async function handler(request: NextRequest) {
  try {
    logger.info('Processing auth request', {
      ...getRequestContext(request),
      path: request.nextUrl.pathname,
    });

    const response = await NextAuth(authOptions)(request);

    logger.info('Auth request processed successfully', {
      ...getRequestContext(request),
      path: request.nextUrl.pathname,
    });

    return response;
  } catch (error) {
    logger.error('Auth request failed', {
      ...getRequestContext(request),
      path: request.nextUrl.pathname,
      error: error as Error,
    });
    throw error;
  }
}

export { handler as GET, handler as POST };
