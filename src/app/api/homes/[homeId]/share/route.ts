import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { shareHome } from '@/lib/home.utils';
import { requireAuth } from '@/lib/session';

const shareSchema = z.object({
  email: z.string().email(),
  role: z.enum(['READ', 'WRITE']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  try {
    const session = await requireAuth();
    const json = await request.json();
    const { email, role } = shareSchema.parse(json);

    const share = await shareHome((await params).homeId, session.id, email, role);

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
