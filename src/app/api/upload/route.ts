import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

import { authOptions } from '@/lib/auth';
import { getStorageProvider } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Resize image
    const resizedBuffer = await sharp(buffer)
      .resize(1920, 1080, {
        // Max dimensions while maintaining aspect ratio
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
      .toBuffer();

    const storageProvider = getStorageProvider();
    const key = await storageProvider.uploadFile(
      resizedBuffer,
      file.name,
      'image/jpeg',
      session.user.id
    );

    return NextResponse.json({ key });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { key } = await request.json();
    if (!key) {
      return NextResponse.json({ error: 'No key provided' }, { status: 400 });
    }

    const storageProvider = getStorageProvider();
    await storageProvider.deleteFile(key, session.user.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: 500 }
    );
  }
}
