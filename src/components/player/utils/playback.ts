import type { NormalizedSource } from '@/types/source.types';

export function getPreferredSource(
  sources: NormalizedSource[],
): NormalizedSource | undefined {
  if (sources.length === 0) return undefined;

  const sorted = [...sources].sort((a, b) => {
    const qA = parseInt(a.quality) || 0;
    const qB = parseInt(b.quality) || 0;
    return qB - qA;
  });

  const hls = sorted.find((s) => s.type === 'hls');
  if (hls) return hls;

  return sorted[0];
}

export function isHls(url: string): boolean {
  return url.includes('.m3u8');
}

export function isDash(url: string): boolean {
  return url.includes('.mpd');
}
