import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { getRequestContext, logger } from '@/lib/logger';
import { requireAuth } from '@/lib/session';
import { getStorageProvider } from '@/lib/storage';

export async function GET(request: NextRequest) {
  logger.info('Starting upload URL generation', {
    ...getRequestContext(request),
  });

  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const homeId = searchParams.get('homeId');

    if (!key) {
      logger.warn('URL generation attempted without key', {
        ...getRequestContext(request),
        userId: session.id,
      });
      return NextResponse.json({ error: 'No key provided' }, { status: 400 });
    }

    // If homeId is provided, verify user has access to the home
    if (homeId) {
      const home = await prisma.home.findUnique({
        where: { id: homeId },
        include: {
          shares: {
            where: { userId: session.id },
          },
          owner: true,
        },
      });

      if (!home) {
        logger.warn('Home not found', {
          ...getRequestContext(request),
          userId: session.id,
          homeId,
        });
        return NextResponse.json({ error: 'Home not found' }, { status: 404 });
      }

      const hasAccess = home.owner.id === session.id || home.shares.length > 0;

      if (!hasAccess) {
        logger.warn('Unauthorized access attempt to home images', {
          ...getRequestContext(request),
          userId: session.id,
          homeId,
        });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // User has access to the home, proceed with URL generation
      const storageProvider = getStorageProvider();
      const url = await storageProvider.getUrl(key, session.id, homeId);

      logger.info('Upload URL generated successfully with home access', {
        ...getRequestContext(request),
        userId: session.id,
        homeId,
        key,
      });

      return NextResponse.json({ url });
    }

    // No homeId provided, verify user owns the image
    const storageProvider = getStorageProvider();
    const url = await storageProvider.getUrl(key, session.id);

    logger.info('Upload URL generated successfully', {
      ...getRequestContext(request),
      userId: session.id,
      key,
    });

    return NextResponse.json({ url });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);

    logger.error('Failed to generate upload URL', {
      ...getRequestContext(request),
      error: errorObject,
    });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
