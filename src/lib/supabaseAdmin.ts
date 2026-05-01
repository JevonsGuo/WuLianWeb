import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidKey = (key: string) => key.startsWith('eyJ') && key.length > 50;

export const supabaseAdmin = supabaseUrl && supabaseUrl.startsWith('http')
  ? createClient(supabaseUrl, isValidKey(supabaseServiceKey) ? supabaseServiceKey : supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');
