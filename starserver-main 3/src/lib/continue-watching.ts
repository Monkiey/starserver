import { MediaType, type ContinueWatchingEntry } from '@/types';

export function normalizeContinueWatchingEntry(
  item: unknown,
): ContinueWatchingEntry | null {
  if (!item || typeof item !== 'object') return null;
  const entry = item as Partial<ContinueWatchingEntry>;

  if (!entry.watchUrl || typeof entry.watchUrl !== 'string') return null;

  const playbackPosition =
    typeof entry.playbackPosition === 'number' &&
    Number.isFinite(entry.playbackPosition)
      ? Math.max(0, entry.playbackPosition)
      : undefined;

  return {
    id: Number(entry.id),
    media_type: entry.media_type ?? MediaType.MOVIE,
    title: entry.title ?? null,
    name: entry.name ?? null,
    poster_path: entry.poster_path ?? null,
    backdrop_path: entry.backdrop_path ?? null,
    watchUrl: entry.watchUrl,
    lastWatchedAt: entry.lastWatchedAt ?? Date.now(),
    playbackPosition,
  };
}

export function parseContinueWatchingEntries(
  raw: string | null,
): ContinueWatchingEntry[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return (parsed as unknown[])
      .map((item) => normalizeContinueWatchingEntry(item))
      .filter((item): item is ContinueWatchingEntry => Boolean(item));
  } catch (error) {
    console.error('Failed to parse continue watching entries', error);
    return [];
  }
}

export function parseContinueWatchingMetadata(
  raw: unknown,
): ContinueWatchingEntry[] {
  if (!raw) return [];

  if (typeof raw === 'string') {
    return parseContinueWatchingEntries(raw);
  }

  if (!Array.isArray(raw)) return [];

  return (raw as unknown[])
    .map((item) => normalizeContinueWatchingEntry(item))
    .filter((item): item is ContinueWatchingEntry => Boolean(item));
}

export function mergeContinueWatchingEntries(
  entries: ContinueWatchingEntry[],
  fallbackEntries: ContinueWatchingEntry[],
): ContinueWatchingEntry[] {
  const combined = [...entries, ...fallbackEntries].sort(
    (a, b) => (b.lastWatchedAt ?? 0) - (a.lastWatchedAt ?? 0),
  );
  const seen = new Set<string>();
  const unique: ContinueWatchingEntry[] = [];

  for (const entry of combined) {
    if (seen.has(entry.watchUrl)) continue;
    seen.add(entry.watchUrl);
    unique.push(entry);
    if (unique.length >= 20) break;
  }

  return unique;
}

export function areContinueWatchingEntriesEqual(
  entries: ContinueWatchingEntry[],
  otherEntries: ContinueWatchingEntry[],
): boolean {
  if (entries.length !== otherEntries.length) return false;

  return entries.every((entry, index) => {
    const other = otherEntries[index];
    return (
      entry.id === other.id &&
      entry.media_type === other.media_type &&
      entry.title === other.title &&
      entry.name === other.name &&
      entry.poster_path === other.poster_path &&
      entry.backdrop_path === other.backdrop_path &&
      entry.watchUrl === other.watchUrl &&
      entry.lastWatchedAt === other.lastWatchedAt &&
      entry.playbackPosition === other.playbackPosition
    );
  });
}

export function removeContinueWatchingEntry(
  entries: ContinueWatchingEntry[],
  watchUrl: string,
): ContinueWatchingEntry[] {
  return entries.filter((entry) => entry.watchUrl !== watchUrl);
}
