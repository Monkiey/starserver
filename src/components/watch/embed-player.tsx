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
  const [reloadKey, setReloadKey] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);

  const handleIframeLoaded = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  const computedUrl = React.useMemo(() => {
    try {
      const url = new URL(props.url);
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('controls', '0');
      url.searchParams.set('mute', '1');
      return url.toString();
    } catch {
      return props.url;
    }
  }, [props.url]);

  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setIsLoaded(false);
    iframe.removeEventListener('load', handleIframeLoaded);
    iframe.addEventListener('load', handleIframeLoaded);

    if (isPlaying) {
      const srcWithBust = `${computedUrl}${
        computedUrl.includes('?') ? '&' : '?'
      }reload=${reloadKey}`;
      iframe.src = srcWithBust;
    } else {
      iframe.src = 'about:blank';
    }

    return () => {
      iframe.removeEventListener('load', handleIframeLoaded);
    };
  }, [computedUrl, handleIframeLoaded, isPlaying, reloadKey]);

  const handleReload = React.useCallback(() => {
    setReloadKey((prev) => prev + 1);
    setIsPlaying(true);
  }, []);

  const handlePlayPause = React.useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background/70 to-black text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="bg-[radial-gradient(circle_at_25%_15%,rgba(59,130,246,0.16),transparent_36%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.12),transparent_34%),radial-gradient(circle_at_10%_70%,rgba(16,185,129,0.12),transparent_32%),linear-gradient(135deg,#0b0f1a 0%,#0b0f1a 40%,#05070c 100%)] absolute inset-0" />
      </div>
      <div className="relative z-[1] mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg backdrop-blur">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 text-foreground shadow-sm hover:border-white/30 hover:bg-white/10"
            onClick={() => router.back()}>
            <Icons.chevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-foreground/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.18)]" />
              Vidsrc secure embed
            </span>
            <span className="hidden text-foreground/70 sm:inline">
              Modern chrome with fast reload
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full bg-white/10 text-foreground hover:bg-white/20"
              onClick={handlePlayPause}>
              {isPlaying ? (
                <>
                  <Icons.pause className="mr-2 h-4 w-4" aria-hidden="true" />
                  Pause
                </>
              ) : (
                <>
                  <Icons.play className="mr-2 h-4 w-4" aria-hidden="true" />
                  Play
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-white/20 bg-white/5 text-foreground hover:border-white/40 hover:bg-white/10"
              onClick={handleReload}>
              <Icons.refresh className="mr-2 h-4 w-4" aria-hidden="true" />
              Reload player
            </Button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/70 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] backdrop-blur-md">
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
            sandbox="allow-scripts allow-same-origin allow-presentation"
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
