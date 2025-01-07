import { Prisma, UserRole } from '@prisma/client';
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

    const searchParams = new URL(request.url).searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'ALL';
    const status = searchParams.get('status') || 'ALL';

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Build where clause for search and filters
    const where: Prisma.UserWhereInput = {
      AND: [
        // Search condition
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
              ],
            }
          : {},
        // Role filter
        role !== 'ALL' ? { role: role as UserRole } : {},
        // Status filter
        status !== 'ALL' ? { isDisabled: status === 'DISABLED' } : {},
      ],
    };

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get paginated users
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isDisabled: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      users,
      total,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);
    logger.error('Error fetching users in admin route', { error: errorObject });
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);
    logger.error('Error updating user in admin route', { error: errorObject });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
