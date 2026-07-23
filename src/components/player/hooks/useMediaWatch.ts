'use client';

import { useEffect, useRef } from 'react';
import type { MediaType } from '@/types/media.types';
import { useMediaDetails } from './useMediaDetails';
import { useMediaSources } from './useMediaSources';
import {
  mapMovieToUnified,
  mapTvEpisodeToUnified,
} from '@/mappers/media.mapper';
import { mapPlaybackResponse } from '@/mappers/playback.mapper';
import { useMediaWatchContext } from '../providers/MediaWatchProvider';

export function useMediaWatch(
  id: string,
  type: MediaType,
  season?: number,
  episode?: number,
) {
  const { setMedia, setError, setIsLoading } = useMediaWatchContext();
  const {
    details,
    isLoading: detailsLoading,
    error: detailsError,
  } = useMediaDetails(id, type, season, episode);
  const {
    sources,
    isLoading: sourcesLoading,
    error: sourcesError,
  } = useMediaSources(id, type, season, episode);

  // Track whether we've already set media to prevent re-setting
  // the same data and causing re-renders
  const hasSetMediaRef = useRef(false);
  const lastSourceUrlRef = useRef<string | undefined>();

  useEffect(() => {
    if (detailsError ?? sourcesError) {
      setError(detailsError ?? sourcesError);
      hasSetMediaRef.current = false;
      return;
    }

    if (!detailsLoading && !sourcesLoading && sources) {
      // Check if the source URL has actually changed
      const firstSourceUrl = sources.sources?.[0]?.url;
      if (
        hasSetMediaRef.current &&
        lastSourceUrlRef.current === firstSourceUrl
      ) {
        return;
      }

      const playback = mapPlaybackResponse(sources);

      let unified;
      if (type === 'movie' && details.movie) {
        unified = mapMovieToUnified(details.movie, playback);
      } else if (type === 'tv' && details.show && details.episode) {
        unified = mapTvEpisodeToUnified(
          details.show,
          details.episode,
          playback,
        );
      } else if (type === 'tv' && details.show) {
        unified = {
          id: details.show.id.toString(),
          type: 'tv' as MediaType,
          title: details.show.name,
          overview: details.show.overview ?? 'No overview available.',
          posterUrl: details.show.poster_path ?? '',
          backdropUrl: details.show.backdrop_path ?? '',
          seasonNumber: season,
          episodeNumber: episode,
          playback,
        };
      }

      if (unified) {
        setMedia(unified);
        setIsLoading(false);
        hasSetMediaRef.current = true;
        lastSourceUrlRef.current = firstSourceUrl;
      } else {
        setError('An error occurred while loading media playback sources.');
      }
    }
  }, [
    details,
    sources,
    detailsLoading,
    sourcesLoading,
    detailsError,
    sourcesError,
    type,
    season,
    episode,
    setMedia,
    setError,
    setIsLoading,
  ]);

  return {
    isLoading: detailsLoading || sourcesLoading,
    error: detailsError ?? sourcesError,
  };
}
