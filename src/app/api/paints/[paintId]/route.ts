import { NextRequest, NextResponse } from 'next/server';

import { getRequestContext, logger } from '@/lib/logger';
import { deletePaint, updatePaint } from '@/lib/paint.utils';
import { requireAuth } from '@/lib/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ paintId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Updating paint', {
      ...getRequestContext(request),
      userId: session.id,
      paintId: (await params).paintId,
    });

    const json = await request.json();
    const paint = await updatePaint((await params).paintId, session.id, json);

    logger.info('Paint updated successfully', {
      userId: session.id,
      paintId: paint.id,
    });

    return NextResponse.json(paint);
  } catch (error) {
    logger.error('Failed to update paint', {
      ...getRequestContext(request),
      paintId: (await params).paintId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ paintId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Deleting paint', {
      ...getRequestContext(request),
      userId: session.id,
      paintId: (await params).paintId,
    });

    await deletePaint((await params).paintId, session.id);

    logger.info('Paint deleted successfully', {
      userId: session.id,
      paintId: (await params).paintId,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('Failed to delete paint', {
      ...getRequestContext(request),
      paintId: (await params).paintId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
