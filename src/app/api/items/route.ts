import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

export async function GET() {
  logger.info('Starting GET /api/items request');

  try {
    const session = await requireAuth();
    logger.debug('User authenticated', { userId: session.id });

    const items = await prisma.item.findMany({
      where: {
        room: {
          home: {
            OR: [
              { userId: session.id },
              {
                shares: {
                  some: {
                    userId: session.id,
                  },
                },
              },
            ],
          },
        },
      },
    });

    logger.info('Items retrieved successfully', {
      userId: session.id,
      itemCount: items.length,
    });

    return NextResponse.json(items);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);

    logger.error('Failed to retrieve items', {
      error: errorObject,
    });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
