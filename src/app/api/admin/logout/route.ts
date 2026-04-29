import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken, destroySession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = getSessionToken(request);
  if (token) {
    destroySession(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
  return response;
}
