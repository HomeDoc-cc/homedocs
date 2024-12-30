import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get token from URL
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      logger.warn('Calendar tasks request without token');
      return new NextResponse('Token is required', { status: 401 });
    }

    // Find calendar token
    const calendarToken = await prisma.calendarToken.findUnique({
      where: { token },
    });

    if (!calendarToken) {
      logger.warn('Calendar tasks request with invalid token', {
        token: token.substring(0, 8) + '...',
      });
      return new NextResponse('Invalid token', { status: 401 });
    }

    // Get tasks for user
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ creatorId: calendarToken.userId }, { assigneeId: calendarToken.userId }],
        isRecurring: true,
      },
      include: {
        home: { select: { name: true } },
        room: { select: { name: true } },
        item: { select: { name: true } },
      },
    });

    logger.info('Calendar tasks fetched successfully', {
      userId: calendarToken.userId,
      count: tasks.length,
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(tasks);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);

    logger.error('Error processing calendar tasks request', {
      error: errorObject,
    });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
