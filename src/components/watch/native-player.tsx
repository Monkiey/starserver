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
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const loadingRef = React.useRef<HTMLDivElement>(null);
  const canPlayNatively = React.useMemo(() => isDirectMediaSource(src), [src]);
  const embedUrl = React.useMemo(() => buildEmbedProviderUrl(src), [src]);
  const [interactionUnlocked, setInteractionUnlocked] = React.useState(false);
  const relockTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    if (canPlayNatively) return;
    setInteractionUnlocked(false);
    if (relockTimerRef.current) {
      clearTimeout(relockTimerRef.current);
      relockTimerRef.current = null;
    }
  }, [canPlayNatively, embedUrl]);

  const unlockTemporarily = React.useCallback(() => {
    setInteractionUnlocked(true);
    if (relockTimerRef.current) clearTimeout(relockTimerRef.current);
    relockTimerRef.current = setTimeout(() => {
      setInteractionUnlocked(false);
      relockTimerRef.current = null;
    }, 8000);
  }, []);

  React.useEffect(() => {
    if (canPlayNatively || !iframeRef.current) return;

    const iframe = iframeRef.current;
    iframe.src = embedUrl;

    const onLoaded = () => {
      iframe.style.opacity = '1';
      if (loadingRef.current) loadingRef.current.style.display = 'none';
    };

    iframe.addEventListener('load', onLoaded);
    return () => {
      iframe.removeEventListener('load', onLoaded);
    };
  }, [canPlayNatively, embedUrl]);

  React.useEffect(() => {
    return () => {
      if (relockTimerRef.current) clearTimeout(relockTimerRef.current);
    };
  }, []);

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
      {canPlayNatively ? (
        <video
          ref={videoRef}
          className="h-full w-full"
          src={src}
          controls
          autoPlay
          playsInline
        />
      ) : (
        <>
          <div
            ref={loadingRef}
            className="absolute z-[1] flex h-full w-full items-center justify-center">
            <Loading />
          </div>
          <iframe
            title="Embedded player"
            className="h-full w-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            referrerPolicy="origin"
            ref={iframeRef}
            style={{
              opacity: 0,
              pointerEvents: interactionUnlocked ? 'auto' : 'none',
            }}
          />
          {!interactionUnlocked && (
            <div
              className="absolute inset-0 z-[3]"
              onPointerDown={unlockTemporarily}
              onClick={unlockTemporarily}
              aria-hidden="true"
            />
          )}
        </>
      )}
    </div>
  );
}

export default NativePlayer;
