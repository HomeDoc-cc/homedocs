import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function adminMiddleware(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      logger.warn('Unauthorized access attempt to admin route', { url: request.url });
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      logger.warn('Non-admin user attempted to access admin route', {
        email: session.user.email,
        url: request.url,
      });
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.next();
  } catch (error: unknown) {
    const errorObject = error instanceof Error ? error : new Error('Unknown error occurred');
    logger.error('Error in admin middleware', { error: errorObject, url: request.url });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
