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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            ownedHomes: true,
            createdTasks: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    logger.error('Error fetching users in admin route', { error });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin access
    const middlewareResponse = await adminMiddleware(request);
    if (middlewareResponse.status !== 200) {
      return middlewareResponse;
    }

    const { userId, role, isDisabled } = await request.json();

    if (!userId || (role === undefined && isDisabled === undefined)) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const updateData: { role?: 'USER' | 'ADMIN'; isDisabled?: boolean } = {};
    if (role !== undefined) updateData.role = role;
    if (isDisabled !== undefined) updateData.isDisabled = isDisabled;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isDisabled: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error('Error updating user in admin route', { error });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 