import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { pinyin } from 'pinyin-pro';

function generateSlug(name: string): string {
  const py = pinyin(name, { toneType: 'none', type: 'array' });
  return py
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let candidate = slug;
  let suffix = 1;
  while (true) {
    let query = supabaseAdmin
      .from('product_categories')
      .select('id')
      .eq('slug', candidate);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { data } = await query;
    if (!data || data.length === 0) return candidate;
    suffix++;
    candidate = `${slug}-${suffix}`;
  }
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('product_categories')
    .select('*')
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const body = await request.json();
  if (body.name && !body.slug) {
    const baseSlug = generateSlug(body.name);
    body.slug = await ensureUniqueSlug(baseSlug);
  }
  const { data, error } = await supabaseAdmin
    .from('product_categories')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function PUT(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const { id, ...updates } = await request.json();
  if (updates.name && !updates.slug) {
    const baseSlug = generateSlug(updates.name);
    updates.slug = await ensureUniqueSlug(baseSlug, id);
  }
  const { data, error } = await supabaseAdmin
    .from('product_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const { id } = await request.json();
  const { error } = await supabaseAdmin
    .from('product_categories')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
