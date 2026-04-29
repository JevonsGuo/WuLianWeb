import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// In-memory session store (resets on server restart; for production use Redis/DB)
const sessions = new Set<string>();

export function createSession(): string {
  const token = crypto.randomUUID();
  sessions.add(token);
  return token;
}

export function validateSession(token: string): boolean {
  return sessions.has(token);
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

export function getSessionToken(request: NextRequest): string | undefined {
  return request.cookies.get('admin_token')?.value;
}

export function isAuthenticated(request: NextRequest): boolean {
  const token = getSessionToken(request);
  if (!token) return false;
  return validateSession(token);
}
