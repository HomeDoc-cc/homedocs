import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
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

    return NextResponse.json({
      email: pendingShare.email,
      homeName: pendingShare.home.name,
      role: pendingShare.role,
    });
  } catch (error) {
    logger.error('Error getting invite details', {
      error: error instanceof Error ? error : undefined,
      token,
    });
    return NextResponse.json(
      { error: 'An error occurred while getting invitation details' },
      { status: 500 }
    );
  }
}
