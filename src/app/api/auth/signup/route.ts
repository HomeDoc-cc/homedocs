import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { createUser } from '@/lib/auth.utils';
import { getRequestContext, logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  logger.info('Processing signup request', {
    ...getRequestContext(request),
  });

  try {
    let json;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const user = await createUser(json);

    logger.info('User created successfully', {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    const errorObject = error instanceof Error ? error : new Error('Unknown error occurred');

    logger.error('Failed to create user', {
      ...getRequestContext(request),
      error: errorObject,
    });

    // Handle validation errors (400)
    if (error instanceof ZodError) {
      // Get the first validation error message
      const firstError = error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    // Handle user exists error (400)
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle all other errors (500)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
