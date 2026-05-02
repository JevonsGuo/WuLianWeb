import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category_id');
  const model = searchParams.get('model');

  let query = supabaseAdmin
    .from('products')
    .select('*')
    .order('sort_order');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  if (model) {
    query = query.eq('model', model);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
