import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/session';
import { createTask, getTasksByItem } from '@/lib/task.utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const task = await createTask(session.id, { ...json, itemId: (await params).itemId });

  return NextResponse.json(task, { status: 201 });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await requireAuth();
  const tasks = await getTasksByItem((await params).itemId, session.id);

  return NextResponse.json(tasks);
}
