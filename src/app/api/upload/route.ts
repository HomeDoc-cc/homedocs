import heicConvert from 'heic-convert';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getStorageProvider } from '@/lib/storage';

async function processImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string; thumbnail: Buffer }> {
  let processedBuffer = buffer;
  let processedMimeType = mimeType;
  
  // Convert HEIC to JPEG first if needed
  if (mimeType.toLowerCase() === 'image/heic') {
    logger.info('Converting HEIC to JPEG');
    try {
      const jpegBuffer = await heicConvert({
        buffer,
        format: 'JPEG',
        quality: 0.85,
      });
      processedBuffer = jpegBuffer;
      processedMimeType = 'image/jpeg';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorObject = error instanceof Error ? error : new Error(errorMessage);
      logger.error('Error converting HEIC', { error: errorObject });
      throw errorObject;
    }
  }

  // Process with sharp for optimization
  try {
    const image = sharp(processedBuffer);
    const metadata = await image.metadata();

    // Resize if image is too large (max 2000px on longest side)
    if (metadata.width && metadata.height) {
      const maxDimension = Math.max(metadata.width, metadata.height);
      if (maxDimension > 2000) {
        const ratio = 2000 / maxDimension;
        await image.resize(
          Math.round(metadata.width * ratio),
          Math.round(metadata.height * ratio),
          { fit: 'inside' }
        );
      }
    }

    // Convert to WebP for better compression if not already WebP
    if (processedMimeType !== 'image/webp') {
      processedBuffer = await image
        .webp({ quality: 80 })
        .rotate() // Preserve rotation
        .toBuffer();
      processedMimeType = 'image/webp';
    } else {
      processedBuffer = await image
        .rotate() // Preserve rotation
        .toBuffer();
    }

    // Generate thumbnail (300px width)
    const thumbnail = await image
      .resize(300, null, { fit: 'inside' })
      .webp({ quality: 60 })
      .toBuffer();

    return { buffer: processedBuffer, mimeType: processedMimeType, thumbnail };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);
    logger.error('Error processing image', { error: errorObject });
    throw errorObject;
  }
}

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: processedBuffer, mimeType, thumbnail } = await processImage(buffer, file.type);

    const storage = getStorageProvider();
    // Update filename extension based on the processed format
    const baseFilename = file.name.split('.')[0];
    const mainFilename = `${baseFilename}.webp`;
    const thumbnailFilename = `${baseFilename}-thumb.webp`;

    // Upload both main image and thumbnail
    const mainKey = await storage.uploadFile(processedBuffer, mainFilename, mimeType, session.user.id);
    const thumbnailKey = await storage.uploadFile(thumbnail, thumbnailFilename, 'image/webp', session.user.id);

    logger.info('File uploaded successfully', {
      userId: session.user.id,
      mainKey,
      thumbnailKey,
      originalType: file.type,
      convertedType: mimeType,
    });

    return NextResponse.json({ key: mainKey, thumbnailKey });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);

    logger.error('Upload error', {
      error: errorObject,
    });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
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

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
