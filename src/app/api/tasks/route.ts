import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/session';
import { createTask, getAllTasks } from '@/lib/task.utils';
import { logger, getRequestContext } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Fetching all tasks', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const tasks = await getAllTasks(session.id);

    logger.info('Tasks fetched successfully', {
      userId: session.id,
      count: tasks.length,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    logger.error('Failed to fetch tasks', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Creating new task', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const json = await request.json();
    const data = {
      ...json,
      isRecurring: Boolean(json.isRecurring),
      interval: json.interval ? parseInt(json.interval) : undefined,
    };

    const task = await createTask(session.id, data);

    logger.info('Task created successfully', {
      userId: session.id,
      taskId: task.id,
      isRecurring: task.isRecurring,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    logger.error('Failed to create task', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
