import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { getPaintByHome, getPaintByRoom } from '@/lib/paint.utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const { homeId } = await params;
    const roomId = searchParams.get('roomId');

    try {
      const paints = roomId
        ? await getPaintByRoom(roomId, session.user.id)
        : await getPaintByHome(homeId, session.user.id);
      return NextResponse.json(paints);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('not found or insufficient permissions')
      ) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/homes/[id]/paint:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
