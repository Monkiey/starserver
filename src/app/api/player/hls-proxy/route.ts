import { NextResponse } from 'next/server';

const ABSOLUTE_URL = /^https?:\/\//i;

const toAbsoluteUrl = (target: string, base: string): string => {
  if (ABSOLUTE_URL.test(target)) return target;
  return new URL(target, base).toString();
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playlistUrl = searchParams.get('url');

  if (!playlistUrl) {
    return NextResponse.json(
      { error: 'Missing url query parameter.' },
      { status: 400 },
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(playlistUrl);
  } catch {
    return NextResponse.json(
      { error: 'Invalid playlist URL.' },
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
      { error: `Playlist fetch failed (${upstream.status}).` },
      { status: 502 },
    );
  }

  const raw = await upstream.text();
  const lines = raw.split('\n');

  const rewritten = lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;

      const absolute = toAbsoluteUrl(trimmed, parsed.toString());
      return `/api/player/hls-segment?url=${encodeURIComponent(absolute)}`;
    })
    .join('\n');

  return new NextResponse(rewritten, {
    status: 200,
    headers: {
      'content-type': 'application/vnd.apple.mpegurl',
      'cache-control': 'no-store',
    },
  });
}
