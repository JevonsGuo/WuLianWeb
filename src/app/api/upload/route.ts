import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    const token = request.cookies.get('admin_token')?.value;
    return NextResponse.json({ error: '未授权', debug: token ? 'token_invalid' : 'no_token' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;

    if (!file || !bucket) {
      return NextResponse.json({ error: '缺少文件或 bucket 参数' }, { status: 400 });
    }

    const allowedBuckets = ['product-images', 'solution-images', 'documents'];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: '无效的 bucket' }, { status: 400 });
    }

    // Supabase Storage keys only support ASCII, so replace all non-ASCII chars (including Chinese)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${safeName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
