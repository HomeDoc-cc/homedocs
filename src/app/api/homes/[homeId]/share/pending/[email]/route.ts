import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/session';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ homeId: string; email: string }> }
) {
  try {
    const session = await requireAuth();
    const { homeId, email } = await params;

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

    // Delete the pending share
    await prisma.pendingHomeShare.delete({
      where: {
        homeId_email: {
          homeId,
          email: decodeURIComponent(email),
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing pending home share:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
