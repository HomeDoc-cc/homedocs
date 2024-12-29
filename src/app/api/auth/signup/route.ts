import { NextRequest, NextResponse } from 'next/server';

import { createUser } from '@/lib/auth.utils';
import { getRequestContext, logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  logger.info('Processing signup request', {
    ...getRequestContext(request),
  });

  try {
    const json = await request.json();
    const user = await createUser(json);

    logger.info('User created successfully', {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);

    logger.error('Failed to create user', {
      ...getRequestContext(request),
      error: errorObject,
    });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
