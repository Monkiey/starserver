import { NextResponse } from 'next/server';

const extractM3u8Url = (html: string): string | null => {
  const patterns = [
    /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/gi,
    /"file"\s*:\s*"(https?:\\\/\\\/[^"\n]+\.m3u8[^"\n]*)"/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (!match) continue;

    const candidate = match[1] ?? match[0];
    const decoded = candidate.replace(/\\\//g, '/');

    try {
      const parsed = new URL(decoded);
      return parsed.toString();
    } catch {
      continue;
    }
  }

  return null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourceUrl = searchParams.get('url');

  if (!sourceUrl) {
    return NextResponse.json(
      { error: 'Missing url query parameter.' },
      { status: 400 },
    );
  }

  try {
    const parsed = new URL(sourceUrl);
    const response = await fetch(parsed.toString(), {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch source page (${response.status}).` },
        { status: 502 },
      );
    }

    const html = await response.text();
    const streamUrl = extractM3u8Url(html);

    if (!streamUrl) {
      return NextResponse.json(
        { error: 'Could not resolve a playable stream URL from embed source.' },
        { status: 422 },
      );
    }

    return NextResponse.json({ streamUrl });
  } catch {
    return NextResponse.json(
      { error: 'Invalid or unsupported source URL.' },
      { status: 400 },
    );
  }
}
