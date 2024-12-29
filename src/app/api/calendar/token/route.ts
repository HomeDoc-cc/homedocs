import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { logger, getRequestContext } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

// Generate a secure random token
function generateToken() {
  return randomBytes(32).toString('hex');
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Fetching calendar token', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const calendarToken = await prisma.calendarToken.findUnique({
      where: {
        userId: session.id,
      },
    });

    if (!calendarToken) {
      logger.info('No calendar token found', {
        userId: session.id,
      });
      return new NextResponse(null, { status: 404 });
    }

    logger.info('Calendar token fetched successfully', {
      userId: session.id,
    });

    return NextResponse.json({ token: calendarToken.token });
  } catch (error) {
    logger.error('Failed to fetch calendar token', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Creating new calendar token', {
      ...getRequestContext(request),
      userId: session.id,
    });

    // Generate a new token
    const token = generateToken();

    // Create or update the calendar token
    const calendarToken = await prisma.calendarToken.upsert({
      where: {
        userId: session.id,
      },
      update: {
        token,
        updatedAt: new Date(),
      },
      create: {
        userId: session.id,
        token,
      },
    });

    logger.info('Calendar token created successfully', {
      userId: session.id,
    });

    return NextResponse.json({ token: calendarToken.token });
  } catch (error) {
    logger.error('Failed to create calendar token', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Deleting calendar token', {
      ...getRequestContext(request),
      userId: session.id,
    });

    // Delete the calendar token
    await prisma.calendarToken.delete({
      where: {
        userId: session.id,
      },
    });

    logger.info('Calendar token deleted successfully', {
      userId: session.id,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('Failed to delete calendar token', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
