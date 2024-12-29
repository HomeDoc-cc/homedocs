import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { logger, getRequestContext } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Searching for users', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const searchTerm = request.nextUrl.searchParams.get('search');
    if (!searchTerm) {
      logger.warn('User search attempted without search term', {
        userId: session.id,
      });
      return NextResponse.json({ error: 'Search term is required' }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
        NOT: {
          id: session.id,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 5,
    });

    logger.info('Users search completed', {
      userId: session.id,
      count: users.length,
      searchTerm,
    });

    return NextResponse.json(users);
  } catch (error) {
    logger.error('Failed to search users', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
