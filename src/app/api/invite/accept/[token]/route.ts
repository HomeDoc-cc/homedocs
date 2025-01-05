import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const session = await requireAuth();

    // Find the pending share
    const pendingShare = await prisma.pendingHomeShare.findUnique({
      where: { token },
      include: {
        home: true,
      },
    });

    if (!pendingShare) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    if (pendingShare.expiresAt < new Date()) {
      await prisma.pendingHomeShare.delete({
        where: { id: pendingShare.id },
      });
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    if (pendingShare.email !== session.email) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    // Create the home share
    const homeShare = await prisma.$transaction(async (tx) => {
      // Create the share
      const share = await tx.homeShare.create({
        data: {
          home: { connect: { id: pendingShare.homeId } },
          user: { connect: { id: session.id } },
          role: pendingShare.role,
        },
        include: {
          home: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Delete the pending share
      await tx.pendingHomeShare.delete({
        where: { id: pendingShare.id },
      });

      return share;
    });

    logger.info('Home share invitation accepted', {
      userId: session.id,
      homeId: homeShare.homeId,
      role: homeShare.role,
    });

    return NextResponse.json(homeShare);
  } catch (error) {
    logger.error('Failed to accept home share invitation', {
      error: error as Error,
      token: token,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
