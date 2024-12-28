import { NextRequest, NextResponse } from 'next/server';

import { getStorageProvider } from '@/lib/storage';
import { requireAuth } from '@/lib/session';

export async function GET(request: NextRequest) {
  const session = await requireAuth();

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'No key provided' }, { status: 400 });
    }

    const storageProvider = getStorageProvider();
    const url = await storageProvider.getUrl(key, session.id);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('URL generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate URL' },
      { status: 500 }
    );
  }
} 