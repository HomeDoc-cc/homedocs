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
  const session = await requireAuth();
  const json = await request.json();
  const { email, role } = shareSchema.parse(json);

  const share = await shareHome((await params).homeId, session.id, email, role);

  return NextResponse.json(share, { status: 201 });
}
