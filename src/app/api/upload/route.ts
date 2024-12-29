import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { getStorageProvider } from '@/lib/storage';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  logger.info('Upload request received');

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      logger.warn('Unauthorized upload attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Processing file upload', {
      userId: session.user.id,
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      logger.warn('Upload attempted without file', {
        userId: session.user.id,
      });
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      logger.warn('Invalid file type uploaded', {
        userId: session.user.id,
        fileType: file.type,
      });
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const storage = getStorageProvider();
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = await storage.uploadFile(buffer, file.name, file.type, session.user.id);

    logger.info('File uploaded successfully', {
      userId: session.user.id,
      key,
    });

    return NextResponse.json({ key });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);

    logger.error('Upload error', {
      error: errorObject,
    });

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  logger.info('Delete request received');

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      logger.warn('Unauthorized delete attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Processing file deletion', {
      userId: session.user.id,
    });

    const { key } = await request.json();

    if (!key) {
      logger.warn('Delete attempted without key', {
        userId: session.user.id,
      });
      return NextResponse.json({ error: 'No key provided' }, { status: 400 });
    }

    const storage = getStorageProvider();
    await storage.deleteFile(key, session.user.id);

    logger.info('File deleted successfully', {
      userId: session.user.id,
      key,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);

    logger.error('Delete error', {
      error: errorObject,
    });

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
