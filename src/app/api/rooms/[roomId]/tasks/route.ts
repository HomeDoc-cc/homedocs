import { NextRequest, NextResponse } from 'next/server';

import { getRequestContext, logger } from '@/lib/logger';
import { requireAuth } from '@/lib/session';
import { createTask, getTasksByRoom } from '@/lib/task.utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Creating new task for room', {
      ...getRequestContext(request),
      userId: session.id,
      roomId: (await params).roomId,
    });

    const json = await request.json();
    const task = await createTask(session.id, { ...json, roomId: (await params).roomId });

    logger.info('Task created successfully', {
      userId: session.id,
      roomId: (await params).roomId,
      taskId: task.id,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    logger.error('Failed to create task', {
      ...getRequestContext(request),
      roomId: (await params).roomId,
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
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Fetching tasks for room', {
      ...getRequestContext(request),
      userId: session.id,
      roomId: (await params).roomId,
    });

    const tasks = await getTasksByRoom((await params).roomId, session.id);

    logger.info('Tasks fetched successfully', {
      userId: session.id,
      roomId: (await params).roomId,
      count: tasks.length,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    logger.error('Failed to fetch tasks', {
      ...getRequestContext(request),
      roomId: (await params).roomId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
