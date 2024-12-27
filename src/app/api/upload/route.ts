import { NextRequest, NextResponse } from 'next/server';

import { uploadFile } from '@/lib/s3';
import { requireAuth } from '@/lib/session';

export async function POST(request: NextRequest) {
  const session = await requireAuth();

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
  }

  // Generate a unique filename
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const fileName = `items/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;

  // Convert File to Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload to S3
  const url = await uploadFile(buffer, fileName, file.type);

  return NextResponse.json({ url });
}
