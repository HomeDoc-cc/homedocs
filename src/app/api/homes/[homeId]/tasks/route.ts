import { NextRequest, NextResponse } from 'next/server';

import { getRequestContext, logger } from '@/lib/logger';
import { requireAuth } from '@/lib/session';
import { createTask, getTasksByHome } from '@/lib/task.utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Creating new task for home', {
      ...getRequestContext(request),
      userId: session.id,
      homeId: (await params).homeId,
    });

    const json = await request.json();
    const task = await createTask(session.id, { ...json, homeId: (await params).homeId });

    logger.info('Task created successfully', {
      userId: session.id,
      homeId: (await params).homeId,
      taskId: task.id,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    logger.error('Failed to create task', {
      ...getRequestContext(request),
      homeId: (await params).homeId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Fetching tasks for home', {
      ...getRequestContext(request),
      userId: session.id,
      homeId: (await params).homeId,
    });

    const tasks = await getTasksByHome((await params).homeId, session.id);

    logger.info('Tasks fetched successfully', {
      userId: session.id,
      homeId: (await params).homeId,
      count: tasks.length,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    logger.error('Failed to fetch tasks', {
      ...getRequestContext(request),
      homeId: (await params).homeId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
