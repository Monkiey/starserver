'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PLAYBACK_CONSTANTS } from './constants/playback';

interface EpisodeAutoplayOverlayProps {
  onNext: () => void;
  onCancel: () => void;
  show: boolean;
}

export function EpisodeAutoplayOverlay({
  onNext,
  onCancel,
  show,
}: EpisodeAutoplayOverlayProps) {
  const [progress, setProgress] = useState(0);
  const duration = PLAYBACK_CONSTANTS.AUTOPLAY_NEXT_DELAY;

  useEffect(() => {
    if (!show) {
      setProgress(0);
      return;
    }

    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const newProgress = (elapsed / duration) * 100;

      if (newProgress >= 100) {
        clearInterval(timer);
        onNext();
      } else {
        setProgress(newProgress);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [show, onNext, duration]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 text-white backdrop-blur-md">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 text-center shadow-2xl">
        <h3 className="text-2xl font-bold">Next Episode in</h3>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-4">
          <Button
            onClick={onNext}
            className="hover:bg-primary/90 flex-1 bg-primary text-primary-foreground">
            Playing Now
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
