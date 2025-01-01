import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { adminMiddleware } from '@/middleware/admin';

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const middlewareResponse = await adminMiddleware(request);
    if (middlewareResponse.status !== 200) {
      return middlewareResponse;
    }

    const [
      totalUsers,
      totalHomes,
      totalTasks,
      totalItems,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.home.count(),
      prisma.task.count(),
      prisma.item.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalHomes,
      totalTasks,
      totalItems,
    });
  } catch (error) {
    logger.error('Error fetching admin stats', { error });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 