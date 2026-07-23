'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaWatchProvider } from '@/components/player/providers/MediaWatchProvider';
import { useMediaWatch } from '@/components/player/hooks/useMediaWatch';
import { MediaPlayer } from '@/components/player/MediaPlayer';
import { ErrorState } from '@/components/player/ErrorState';
import { useOmss } from '@/hooks/use-omss';
import { MediaType as StarMediaType } from '@/types';
import type { MediaType as CineMediaType } from '@/types/media.types';

interface OmssPlayerProps {
  tmdbId?: string;
  mediaType: StarMediaType.MOVIE | StarMediaType.TV;
  season?: string;
  episode?: string;
  showId?: number;
}

function OmssPlayerContent({
  tmdbId,
  mediaType,
  season,
  episode,
}: OmssPlayerProps) {
  const router = useRouter();
  const { valid } = useOmss();

  const type: CineMediaType =
    mediaType === StarMediaType.MOVIE ? 'movie' : 'tv';

  const parsedSeason = season
    ? parseInt(season, 10)
    : type === 'tv'
    ? 1
    : undefined;
  const parsedEpisode = episode
    ? parseInt(episode, 10)
    : type === 'tv'
    ? 1
    : undefined;

  const id = tmdbId ?? '';
  const media = useMediaWatch(
    valid ? id : '',
    type,
    valid ? parsedSeason : undefined,
    valid ? parsedEpisode : undefined,
  );

  const { error } = media;

  if (!valid) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-black text-white">
        <div className="max-w-md space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <p className="text-zinc-300">
            Your OMSS server is unreachable or offline.
          </p>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="border-zinc-700 text-white">
            Return Home
          </Button>
        </div>
        <div className="absolute left-4 top-4 z-50">
          <Button
            variant="ghost"
            className="border border-zinc-800 text-white hover:bg-zinc-800"
            onClick={() => router.back()}>
            <ChevronLeft className="mr-1 h-5 w-5" /> Back
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-black">
        <div className="absolute left-4 top-4 z-50">
          <Button
            variant="ghost"
            className="border border-zinc-800 text-white hover:bg-zinc-800"
            onClick={() => router.back()}>
            <ChevronLeft className="mr-1 h-5 w-5" /> Back
          </Button>
        </div>
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="absolute left-4 top-4 z-50">
        <Button
          variant="ghost"
          className="border border-zinc-800 text-white backdrop-blur-sm hover:bg-zinc-800/80"
          onClick={() => router.back()}>
          <ChevronLeft className="mr-1 h-5 w-5" /> Back
        </Button>
      </div>

      <div className="h-screen w-full bg-black">
        <MediaPlayer />
      </div>
    </div>
  );
}

export default function OmssPlayer(props: OmssPlayerProps) {
  return (
    <MediaWatchProvider>
      <OmssPlayerContent {...props} />
    </MediaWatchProvider>
  );
}
