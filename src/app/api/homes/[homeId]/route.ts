import { NextRequest, NextResponse } from 'next/server';

import { deleteHome, getHomeById, updateHome } from '@/lib/home.utils';
import { getRequestContext, logger } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Fetching home details', {
      ...getRequestContext(request),
      userId: session.id,
      homeId: (await params).homeId,
    });

    const home = await getHomeById((await params).homeId, session.id);

    logger.info('Home details fetched successfully', {
      userId: session.id,
      homeId: home.id,
    });

    return NextResponse.json(home);
  } catch (error) {
    logger.error('Failed to fetch home details', {
      ...getRequestContext(request),
      homeId: (await params).homeId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Updating home', {
      ...getRequestContext(request),
      userId: session.id,
      homeId: (await params).homeId,
    });

    const json = await request.json();
    const home = await updateHome((await params).homeId, session.id, json);

    logger.info('Home updated successfully', {
      userId: session.id,
      homeId: home.id,
    });

    return NextResponse.json(home);
  } catch (error) {
    logger.error('Failed to update home', {
      ...getRequestContext(request),
      homeId: (await params).homeId,
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
  { params }: { params: Promise<{ homeId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Deleting home', {
      ...getRequestContext(request),
      userId: session.id,
      homeId: (await params).homeId,
    });

    await deleteHome((await params).homeId, session.id);

    logger.info('Home deleted successfully', {
      userId: session.id,
      homeId: (await params).homeId,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('Failed to delete home', {
      ...getRequestContext(request),
      homeId: (await params).homeId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
