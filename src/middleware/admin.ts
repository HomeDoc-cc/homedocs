import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function adminMiddleware(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      logger.warn('Unauthorized access attempt to admin route', {
        url: request.url,
        session: session ? 'exists' : 'null',
        user: session?.user ? 'exists' : 'null',
      });
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      logger.warn('Non-admin user attempted to access admin route', {
        email: session.user.email,
        role: user?.role,
        url: request.url,
      });
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.next();
  } catch (error: unknown) {
    const errorObject = error instanceof Error ? error : new Error('Unknown error occurred');
    logger.error('Error in admin middleware', {
      error: errorObject,
      url: request.url,
      stack: errorObject.stack,
    });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
