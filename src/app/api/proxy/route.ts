import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'Missing url parameter' },
      { status: 400 },
    );
  }

  // Only allow proxying vidsrc.cc URLs
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (parsed.hostname !== 'vidsrc.cc') {
    return NextResponse.json(
      { error: 'Only vidsrc.cc URLs are allowed' },
      { status: 403 },
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        Referer: 'https://vidsrc.cc/',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${response.status}` },
        { status: response.status },
      );
    }

    let html = await response.text();
    const origin = parsed.origin;

    // Rewrite relative URLs to absolute so assets load from vidsrc
    // Handle src="/..." and href="/..."
    html = html.replace(/(src|href|action)=(["'])\/(?!\/)/g, `$1=$2${origin}/`);

    // Inject a <base> tag so any remaining relative URLs resolve correctly
    html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/">`);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch upstream content' },
      { status: 502 },
    );
  }
}
