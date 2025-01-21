import { NextRequest, NextResponse } from 'next/server';

import { getRequestContext, logger } from '@/lib/logger';
import { requireAuth } from '@/lib/session';
import { createTask, getAllTasks, getTasksByLocation } from '@/lib/task.utils';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Fetching tasks', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const { searchParams } = new URL(request.url);
    const homeId = searchParams.get('homeId');
    const roomId = searchParams.get('roomId');
    const itemId = searchParams.get('itemId');

    // If no location parameters are provided, fetch all tasks
    const locationParams = [homeId, roomId, itemId].filter(Boolean);
    if (locationParams.length === 0) {
      const tasks = await getAllTasks(session.id);
      return NextResponse.json(tasks);
    }

    // If location parameters are provided, ensure only one is present
    if (locationParams.length !== 1) {
      return NextResponse.json(
        { error: 'Must provide exactly one of: homeId, roomId, or itemId query parameter' },
        { status: 400 }
      );
    }

    let type: string;
    let id: string;

    if (homeId) {
      type = 'home';
      id = homeId;
    } else if (roomId) {
      type = 'room';
      id = roomId;
    } else {
      type = 'item';
      id = itemId!;
    }

    const tasks = await getTasksByLocation(session.id, type, id);

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
    const task = await createTask(session.id, json);

    logger.info('Task created successfully', {
      userId: session.id,
      taskId: task.id,
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
