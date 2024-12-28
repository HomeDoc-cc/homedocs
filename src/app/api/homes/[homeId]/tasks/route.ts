import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/session';
import { createTask, getTasksByHome } from '@/lib/task.utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const task = await createTask(session.id, { ...json, homeId: (await params).homeId });

  return NextResponse.json(task, { status: 201 });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ homeId: string }> }) {
  const session = await requireAuth();
  const tasks = await getTasksByHome((await params).homeId, session.id);

  return NextResponse.json(tasks);
}
