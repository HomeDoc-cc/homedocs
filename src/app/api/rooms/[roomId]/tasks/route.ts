import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/session';
import { createTask, getTasksByRoom } from '@/lib/task.utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const task = await createTask(session.id, { ...json, roomId: (await params).roomId });

  return NextResponse.json(task, { status: 201 });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const session = await requireAuth();
  const tasks = await getTasksByRoom((await params).roomId, session.id);

  return NextResponse.json(tasks);
}
