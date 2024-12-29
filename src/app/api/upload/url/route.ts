import { NextRequest, NextResponse } from 'next/server';

import { getStorageProvider } from '@/lib/storage';
import { requireAuth } from '@/lib/session';
import { logger, getRequestContext } from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.info('Starting upload URL generation', {
    ...getRequestContext(request),
  });

  try {
    const session = await requireAuth();
    logger.info('User authenticated', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      logger.warn('URL generation attempted without key', {
        ...getRequestContext(request),
        userId: session.id,
      });
      return NextResponse.json({ error: 'No key provided' }, { status: 400 });
    }

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

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 