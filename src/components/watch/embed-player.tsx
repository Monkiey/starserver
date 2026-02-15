'use client';
import React from 'react';
import Loading from '../ui/loading';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface EmbedPlayerProps {
  url: string;
}

function EmbedPlayer(props: EmbedPlayerProps) {
  const router = useRouter();

  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handleIframeLoaded = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handlePlay = React.useCallback(() => {
    setIsPlaying(true);
  }, []);

  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setIsLoaded(false);
    iframe.src = isPlaying ? props.url : '';

    iframe.addEventListener('load', handleIframeLoaded);
    return () => {
      iframe.removeEventListener('load', handleIframeLoaded);
    };
  }, [handleIframeLoaded, isPlaying, props.url]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background/80 to-black text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.12),transparent_30%),linear-gradient(to_bottom,#0b0f1a,transparent_45%)]" />
      </div>
      <div className="relative z-[1] mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 text-foreground shadow-sm hover:border-white/30 hover:bg-white/10"
            onClick={() => router.back()}>
            <Icons.chevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-foreground/80">
              Immersive player
            </span>
            <span className="hidden sm:inline">
              Embedded playback with a cinematic feel
            </span>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/70 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] backdrop-blur-md">
          {!isPlaying && (
            <div className="absolute inset-0 z-[2] grid place-items-center bg-gradient-to-b from-background/70 via-background/80 to-black/80">
              <div className="flex flex-col items-center gap-4 text-center">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg transition hover:scale-[1.02]"
                  onClick={handlePlay}>
                  <Icons.play className="mr-2 h-5 w-5" aria-hidden="true" />
                  Play
                </Button>
                <p className="max-w-md text-sm text-muted-foreground">
                  Start the embedded player for a seamless, fullscreen-friendly
                  experience.
                </p>
              </div>
            </div>
          )}
          <div
            className={cn(
              'absolute inset-0 z-[1] grid place-items-center bg-gradient-to-b from-background/60 via-background/70 to-black/80 transition-opacity duration-500',
              isLoaded ? 'pointer-events-none opacity-0' : 'opacity-100',
            )}>
            <div className="flex flex-col items-center gap-3 text-center">
              <Loading />
              <p className="text-sm text-muted-foreground">
                Preparing the player...
              </p>
            </div>
          </div>
          <iframe
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            ref={iframeRef}
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
            referrerPolicy="no-referrer-when-downgrade"
            className={cn(
              'h-[65vh] w-full transition-opacity duration-500 md:h-[70vh] lg:h-[75vh]',
              isLoaded ? 'opacity-100' : 'opacity-0',
            )}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground/80">
            <Icons.sparkles
              className="h-4 w-4 text-primary"
              aria-hidden="true"
            />
            <span>Tip: Enable fullscreen for a cinematic view.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EmbedPlayer;
