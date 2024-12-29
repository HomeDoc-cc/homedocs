import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

import { getRequestContext, logger } from '@/lib/logger';

const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './uploads';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const filename = (await params).filename;
  logger.info('Starting file serve request', {
    ...getRequestContext(request),
    filename,
  });

  try {
    const filePath = path.join(LOCAL_STORAGE_PATH, filename);
    const file = await fs.readFile(filePath);

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.heic': 'image/heic',
      }[ext] || 'application/octet-stream';

    logger.info('File served successfully', {
      ...getRequestContext(request),
      filename,
      contentType,
      size: file.length,
    });

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);

    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      logger.warn('File not found', {
        ...getRequestContext(request),
        filename,
        error: errorObject,
      });
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    logger.error('Failed to serve file', {
      ...getRequestContext(request),
      filename,
      error: errorObject,
    });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
