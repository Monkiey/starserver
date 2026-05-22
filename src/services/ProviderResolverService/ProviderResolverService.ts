export interface ProviderAttempt {
  provider: string;
  ok: boolean;
  reason: string;
  status?: number;
  streamUrl?: string;
}

export interface ProviderResolveResult {
  ok: boolean;
  streamUrl?: string;
  attempts: ProviderAttempt[];
}

interface ProviderAdapter {
  name: string;
  canHandle: (url: URL) => boolean;
  resolve: (url: URL) => Promise<ProviderAttempt>;
}

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
      return new URL(decoded).toString();
    } catch {
      continue;
    }
  }

  return null;
};

const buildDefaultAttempts = (url: URL): RequestInit[] => {
  const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

  return [
    { headers: { 'user-agent': userAgent }, cache: 'no-store' },
    {
      headers: {
        'user-agent': userAgent,
        referer: `${url.origin}/`,
        origin: url.origin,
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
      cache: 'no-store',
    },
  ];
};

const genericHtmlAdapter: ProviderAdapter = {
  name: 'generic-html',
  canHandle: () => true,
  async resolve(url: URL): Promise<ProviderAttempt> {
    let lastStatus: number | undefined;

    for (const init of buildDefaultAttempts(url)) {
      const response = await fetch(url.toString(), init);
      lastStatus = response.status;

      if (!response.ok) continue;
      const html = await response.text();
      const streamUrl = extractM3u8Url(html);

      if (streamUrl) {
        return {
          provider: 'generic-html',
          ok: true,
          reason: 'Resolved HLS stream URL from provider page.',
          status: response.status,
          streamUrl,
        };
      }

      return {
        provider: 'generic-html',
        ok: false,
        reason: 'Provider page loaded but no HLS stream URL found.',
        status: response.status,
      };
    }

    return {
      provider: 'generic-html',
      ok: false,
      reason: 'Provider blocked server-side page fetch attempts.',
      status: lastStatus,
    };
  },
};

const vidsrcAdapter: ProviderAdapter = {
  name: 'vidsrc',
  canHandle: (url) => url.hostname.toLowerCase().endsWith('vidsrc.cc'),
  async resolve(url) {
    return genericHtmlAdapter.resolve(url);
  },
};

const PROVIDER_ADAPTERS: ProviderAdapter[] = [
  vidsrcAdapter,
  genericHtmlAdapter,
];

export class ProviderResolverService {
  static async resolve(sourceUrl: string): Promise<ProviderResolveResult> {
    let parsed: URL;

    try {
      parsed = new URL(sourceUrl);
    } catch {
      return {
        ok: false,
        attempts: [
          {
            provider: 'url-parse',
            ok: false,
            reason: 'Invalid source URL.',
          },
        ],
      };
    }

    const attempts: ProviderAttempt[] = [];
    const adapters = PROVIDER_ADAPTERS.filter((adapter) =>
      adapter.canHandle(parsed),
    );

    for (const adapter of adapters) {
      try {
        const result = await adapter.resolve(parsed);
        attempts.push({ ...result, provider: adapter.name });
        if (result.ok && result.streamUrl) {
          return { ok: true, streamUrl: result.streamUrl, attempts };
        }
      } catch {
        attempts.push({
          provider: adapter.name,
          ok: false,
          reason: 'Provider adapter failed unexpectedly.',
        });
      }
    }

    return { ok: false, attempts };
  }
}
