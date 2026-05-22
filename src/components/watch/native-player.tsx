'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useContinueWatchingStore } from '@/stores/continue-watching';
import type { MediaType } from '@/types';

interface NativePlayerProps {
  src: string;
  showId?: number;
  mediaType?: MediaType;
}

function NativePlayer({ src, showId, mediaType }: NativePlayerProps) {
  const router = useRouter();
  const videoRef = React.useRef<HTMLVideoElement>(null);

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
      <video
        ref={videoRef}
        className="h-full w-full"
        src={src}
        controls
        autoPlay
        playsInline
      />
    </div>
  );
}

export default NativePlayer;
