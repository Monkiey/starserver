'use client';

import { useEffect, useState } from 'react';
import { useOmss } from '@/hooks/use-omss';
import { omssService } from '@/services/omss.service';
import type { MediaType } from '@/types/media.types';
import type { SourceResponse } from '@omss/sdk';

export function useMediaSources(
  id: string,
  type: MediaType,
  season?: number,
  episode?: number,
) {
  const { client, baseUrl } = useOmss();
  const [sources, setSources] = useState<SourceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function fetchSources() {
      if (!id) return;
      setIsLoading(true);
      setError(undefined);
      try {
        if (type === 'movie') {
          const res = await omssService.getMovieSources(client, id);
          setSources(res);
        } else if (season !== undefined && episode !== undefined) {
          const res = await omssService.getTvSources(
            client,
            id,
            season,
            episode,
          );
          setSources(res);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (
          msg.includes('Failed to fetch') ||
          msg.includes('Network error') ||
          msg.includes('fetch')
        ) {
          setError(
            `Unable to connect to OMSS backend server at ${baseUrl}. Please verify your streaming backend URL in Settings.`,
          );
        } else {
          setError(msg);
        }
      } finally {
        setIsLoading(false);
      }
    }

    void fetchSources();
  }, [id, type, season, episode, client, baseUrl]);

  return { sources, isLoading, error };
}
