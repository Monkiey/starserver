'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useContinueWatchingStore } from '@/stores/continue-watching';
import type { MediaType } from '@/types';
import Loading from '../ui/loading';

interface NativePlayerProps {
  src: string;
  showId?: number;
  mediaType?: MediaType;
}

const isDirectMediaSource = (source: string): boolean => {
  try {
    const parsed = new URL(source);
    const pathname = parsed.pathname.toLowerCase();
    return (
      pathname.endsWith('.m3u8') ||
      pathname.endsWith('.mp4') ||
      pathname.endsWith('.webm') ||
      pathname.endsWith('.ogg')
    );
  } catch {
    return false;
  }
};

const buildEmbedProviderUrl = (rawUrl: string): string => {
  try {
    const parsed = new URL(rawUrl);
    const playbackFlags: Record<string, string> = {
      autoplay: '1',
      playsinline: '1',
      controls: '1',
      mute: '0',
      ds_lang: 'en',
      ds_player: '1',
    };

    Object.entries(playbackFlags).forEach(([key, value]) => {
      if (!parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, value);
      }
    });

    if (!parsed.searchParams.has('origin') && typeof window !== 'undefined') {
      parsed.searchParams.set('origin', window.location.origin);
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
};

function NativePlayer({ src, showId, mediaType }: NativePlayerProps) {
  const router = useRouter();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canPlayNatively = React.useMemo(() => isDirectMediaSource(src), [src]);
  const [resolvedSrc, setResolvedSrc] = React.useState<string | null>(
    canPlayNatively ? src : null,
  );
  const [resolving, setResolving] = React.useState(!canPlayNatively);
  const [resolveError, setResolveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const resolveEmbeddedSource = async () => {
      if (canPlayNatively) {
        setResolvedSrc(src);
        setResolving(false);
        setResolveError(null);
        return;
      }

      setResolving(true);
      setResolveError(null);

      try {
        const preparedUrl = buildEmbedProviderUrl(src);
        const response = await fetch(
          `/api/player/resolve?url=${encodeURIComponent(preparedUrl)}`,
        );
        const data = (await response.json()) as {
          streamUrl?: string;
          error?: string;
        };

        if (!response.ok || !data.streamUrl) {
          throw new Error(data.error ?? 'Unable to resolve stream URL.');
        }

        if (!cancelled) {
          setResolvedSrc(data.streamUrl);
          setResolving(false);
        }
      } catch (error) {
        if (!cancelled) {
          setResolvedSrc(null);
          setResolving(false);
          setResolveError(
            error instanceof Error
              ? error.message
              : 'Unable to resolve stream URL.',
          );
        }
      }
    };

    void resolveEmbeddedSource();

    return () => {
      cancelled = true;
    };
  }, [canPlayNatively, src]);

  React.useEffect(() => {
    if (!showId || !Number.isFinite(showId) || !mediaType) return;

    const saveProgress = () => {
      useContinueWatchingStore.getState().refreshItem(showId, mediaType);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveProgress();
      }
    };

    window.addEventListener('beforeunload', saveProgress);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      saveProgress();
      window.removeEventListener('beforeunload', saveProgress);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showId, mediaType]);

  return (
    <div className="absolute inset-0 bg-black">
      <div className="header-top absolute left-0 right-0 top-8 z-[2] flex h-fit w-fit items-center justify-between gap-x-5 px-4 md:h-20 md:gap-x-8 md:px-10 lg:h-24">
        <div className="flex flex-1 items-center gap-x-5 md:gap-x-8">
          <svg
            className="h-10 w-10 flex-shrink-0 cursor-pointer transition hover:scale-125"
            stroke="#fff"
            fill="#fff"
            strokeWidth="0"
            viewBox="0 0 16 16"
            height="16px"
            width="16px"
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => router.back()}>
            <path
              fillRule="evenodd"
              d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"></path>
          </svg>
        </div>
      </div>
      {resolving ? (
        <div className="absolute z-[1] flex h-full w-full items-center justify-center">
          <Loading />
        </div>
      ) : resolvedSrc ? (
        <video
          ref={videoRef}
          className="h-full w-full"
          src={resolvedSrc}
          controls
          autoPlay
          playsInline
        />
      ) : (
        <div className="absolute inset-0 z-[1] flex items-center justify-center px-4 text-center text-sm text-white/80">
          {resolveError ??
            'This source could not be resolved for native playback.'}
        </div>
      )}
    </div>
  );
}

export default NativePlayer;
