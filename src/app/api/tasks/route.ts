import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/session';
import { createTask, getAllTasks } from '@/lib/task.utils';

export async function GET() {
  const session = await requireAuth();
  const tasks = await getAllTasks(session.id);

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  const json = await request.json();

  const data = {
    ...json,
    isRecurring: Boolean(json.isRecurring),
    interval: json.interval ? parseInt(json.interval) : undefined,
  };

  const task = await createTask(session.id, data);

  return NextResponse.json(task, { status: 201 });
}
