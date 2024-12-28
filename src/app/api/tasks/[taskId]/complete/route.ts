import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/session';
import { completeTask } from '@/lib/task.utils';

export async function POST(_: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const session = await requireAuth();
  const task = await completeTask((await params).taskId, session.id);

  return NextResponse.json(task);
}
