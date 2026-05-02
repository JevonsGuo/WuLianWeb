import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const name = searchParams.get('name');

  if (!url) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: '文件获取失败' }, { status: 500 });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const buffer = await res.arrayBuffer();

    const encodedName = name
      ? `filename*=UTF-8''${encodeURIComponent(name)}`
      : '';

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': `attachment${encodedName ? '; ' + encodedName : ''}`,
    };

    return new NextResponse(buffer, { headers });
  } catch {
    return NextResponse.json({ error: '下载失败' }, { status: 500 });
  }
}
