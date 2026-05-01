import { NextResponse } from 'next/server';

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  return NextResponse.json({
    supabaseUrl: url ? `${url.slice(0, 20)}...` : 'MISSING',
    serviceKeyPrefix: serviceKey ? `${serviceKey.slice(0, 10)}...` : 'MISSING',
    serviceKeyLength: serviceKey.length,
    serviceKeyValid: serviceKey.startsWith('eyJ') && serviceKey.length > 100,
    anonKeyPrefix: anonKey ? `${anonKey.slice(0, 10)}...` : 'MISSING',
    anonKeyLength: anonKey.length,
  });
}
