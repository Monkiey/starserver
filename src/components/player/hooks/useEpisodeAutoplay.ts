'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTmdb } from '@/hooks/use-tmdb';
import { usePlayerState } from './usePlayerState';
import { autoplayService } from '@/services/autoplay.service';

export function useEpisodeAutoplay() {
  const { media, autoplayEnabled } = usePlayerState();
  const tmdb = useTmdb();
  const router = useRouter();

  const handleEpisodeEnded = useCallback(async () => {
    if (
      !autoplayEnabled ||
      !media ||
      media.type !== 'tv' ||
      media.seasonNumber === undefined ||
      media.episodeNumber === undefined
    ) {
      return;
    }

    try {
      const next = await autoplayService.getNextEpisode(
        tmdb,
        media.id,
        media.seasonNumber,
        media.episodeNumber,
      );

      if (next) {
        router.push(
          `/watch/tv/${media.id}/player?season=${next.season}&episode=${next.episode}`,
        );
      }
    } catch (e) {
      console.error('Failed to navigate to next episode:', e);
    }
  }, [media, autoplayEnabled, tmdb, router]);

  return { handleEpisodeEnded };
}
