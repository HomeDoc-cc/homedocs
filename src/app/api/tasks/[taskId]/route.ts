import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/session';
import { deleteTask, updateTask } from '@/lib/task.utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const task = await updateTask((await params).taskId, session.id, json);

  return NextResponse.json(task);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const session = await requireAuth();
  await deleteTask((await params).taskId, session.id);

  return new NextResponse(null, { status: 204 });
}
