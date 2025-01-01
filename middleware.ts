import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { adminMiddleware } from '@/middleware/admin';

export async function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
    return adminMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}; 