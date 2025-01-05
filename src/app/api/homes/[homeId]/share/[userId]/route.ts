import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/session';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ homeId: string; userId: string }> }
) {
  try {
    const session = await requireAuth();
    const { homeId, userId } = await params;

    // Check if the user is the home owner
    const home = await prisma.home.findFirst({
      where: {
        id: homeId,
        userId: session.id,
      },
    });

    if (!home) {
      return new NextResponse('Home not found or insufficient permissions', { status: 404 });
    }

    // Delete the share
    await prisma.homeShare.delete({
      where: {
        homeId_userId: {
          homeId,
          userId,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing home share:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
