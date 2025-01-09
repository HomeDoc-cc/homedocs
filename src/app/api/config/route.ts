import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    auth: {
      googleEnabled: process.env.GOOGLE_ENABLED === 'true',
      oidcEnabled: process.env.OIDC_ENABLED === 'true',
    },
  });
}
