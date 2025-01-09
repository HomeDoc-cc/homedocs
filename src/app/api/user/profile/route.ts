import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getRequestContext, logger } from '@/lib/logger';

const updateProfileSchema = z.object({
  name: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    logger.error('Failed to fetch user profile', {
      ...getRequestContext(request),
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    });

    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    logger.info('Profile update request received', {
      ...getRequestContext(request),
      userId: session?.user?.id,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let json;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    logger.info('Processing profile update', {
      ...getRequestContext(request),
      userId: session.user.id,
      requestData: json,
    });

    const { name } = updateProfileSchema.parse(json);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    logger.info('User profile updated successfully', {
      ...getRequestContext(request),
      userId: user.id,
      updatedName: user.name,
    });

    return NextResponse.json(user);
  } catch (error) {
    logger.error('Failed to update user profile', {
      ...getRequestContext(request),
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
