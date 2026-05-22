import { NextResponse } from 'next/server';
import { ProviderResolverService } from '@/services/ProviderResolverService/ProviderResolverService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourceUrl = searchParams.get('url');

  if (!sourceUrl) {
    return NextResponse.json(
      { error: 'Missing url query parameter.' },
      { status: 400 },
    );
  }

  const resolution = await ProviderResolverService.resolve(sourceUrl);

  if (!resolution.ok || !resolution.streamUrl) {
    return NextResponse.json(
      {
        error:
          'Could not resolve a playable stream from configured provider adapters.',
        attempts: resolution.attempts,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    streamUrl: resolution.streamUrl,
    attempts: resolution.attempts,
  });
}
