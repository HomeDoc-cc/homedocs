import { NextRequest, NextResponse } from 'next/server';

import { deleteTask, updateTask } from '@/lib/task.utils';
import { getRequestContext, logger } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Updating task', {
      ...getRequestContext(request),
      userId: session.id,
      taskId: (await params).taskId,
    });

    const json = await request.json();
    const task = await updateTask((await params).taskId, session.id, json);

    logger.info('Task updated successfully', {
      userId: session.id,
      taskId: task.id,
    });

    return NextResponse.json(task);
  } catch (error) {
    logger.error('Failed to update task', {
      ...getRequestContext(request),
      taskId: (await params).taskId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Deleting task', {
      ...getRequestContext(request),
      userId: session.id,
      taskId: (await params).taskId,
    });

    await deleteTask((await params).taskId, session.id);

    logger.info('Task deleted successfully', {
      userId: session.id,
      taskId: (await params).taskId,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('Failed to delete task', {
      ...getRequestContext(request),
      taskId: (await params).taskId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
