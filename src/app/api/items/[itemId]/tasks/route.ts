import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/session';
import { createTask, getTasksByItem } from '@/lib/task.utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const itemId = (await params).itemId;
  logger.info('Starting task creation', { itemId });

  try {
    const session = await requireAuth();
    const json = await request.json();
    const task = await createTask(session.id, { ...json, itemId });

    logger.info('Task created successfully', {
      userId: session.id,
      taskId: task.id,
      itemId,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);

    logger.error('Failed to create task', {
      itemId,
      error: errorObject,
    });

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const itemId = (await params).itemId;
  logger.info('Starting tasks fetch', { itemId });

  try {
    const session = await requireAuth();
    const tasks = await getTasksByItem(itemId, session.id);

    logger.info('Tasks fetched successfully', {
      userId: session.id,
      itemId,
      taskCount: tasks.length,
    });

    return NextResponse.json(tasks);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);

    logger.error('Failed to fetch tasks', {
      itemId,
      error: errorObject,
    });

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
