import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in ms

function getSecret(): string {
  return process.env.ADMIN_PASSWORD!;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

/**
 * Create a stateless session token (HMAC-signed timestamp).
 * No server-side storage needed — survives server restarts / HMR.
 */
export function createSession(): string {
  const ts = Date.now().toString();
  const signature = sign(ts);
  return Buffer.from(`${ts}.${signature}`).toString('base64');
}

/**
 * Validate a session token by verifying the HMAC signature and expiration.
 */
export function validateSession(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [ts, signature] = decoded.split('.');
    if (!ts || !signature) return false;

    const expected = sign(ts);
    if (
      !timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expected, 'hex'),
      )
    ) {
      return false;
    }

    const issuedAt = parseInt(ts, 10);
    if (Date.now() - issuedAt > SESSION_MAX_AGE) return false;

    return true;
  } catch {
    return false;
  }
}

export function getSessionToken(request: NextRequest): string | undefined {
  return request.cookies.get('admin_token')?.value;
}

export function isAuthenticated(request: NextRequest): boolean {
  const token = getSessionToken(request);
  if (!token) return false;
  return validateSession(token);
}
