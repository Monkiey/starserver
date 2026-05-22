import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const segmentUrl = searchParams.get('url');

  if (!segmentUrl) {
    return NextResponse.json(
      { error: 'Missing url query parameter.' },
      { status: 400 },
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(segmentUrl);
  } catch {
    return NextResponse.json(
      { error: 'Invalid segment URL.' },
      { status: 400 },
    );
  }

  const upstream = await fetch(parsed.toString(), {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      referer: `${parsed.origin}/`,
      origin: parsed.origin,
      accept: '*/*',
    },
    cache: 'no-store',
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Segment fetch failed (${upstream.status}).` },
      { status: 502 },
    );
  }

  const contentType =
    upstream.headers.get('content-type') ?? 'application/octet-stream';
  const data = await upstream.arrayBuffer();

  return new NextResponse(data, {
    status: 200,
    headers: {
      'content-type': contentType,
      'cache-control': 'no-store',
    },
  });
}
