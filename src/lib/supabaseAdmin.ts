import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidKey = (key: string) => key.startsWith('eyJ') && key.length > 100;

function createAdminClient() {
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  if (isValidKey(supabaseServiceKey)) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn('[supabaseAdmin] SUPABASE_SERVICE_ROLE_KEY is missing or invalid. Falling back to ANON_KEY. Admin operations may fail with schema cache errors.');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabaseAdmin = createAdminClient();
