'use client';
import React from 'react';
import Loading from '../ui/loading';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, ChevronLeft, Server } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface VideoSource {
  label: string;
  url: string;
}

interface EmbedPlayerProps {
  sources: VideoSource[];
}

function EmbedPlayer({ sources }: EmbedPlayerProps) {
  const router = useRouter();

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const activeSource = sources[activeIndex];

  const handleIframeLoaded = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    setIsLoaded(false);
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.src = activeSource.url;
      iframe.addEventListener('load', handleIframeLoaded);
      return () => iframe.removeEventListener('load', handleIframeLoaded);
    }
  }, [activeSource.url, handleIframeLoaded]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: '#000',
      }}>
      {/* Top gradient for header visibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-28 bg-gradient-to-b from-black/70 to-transparent" />

      {/* Header */}
      <div className="absolute inset-x-0 top-0 z-[4] flex items-center justify-between px-4 py-4 md:px-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20">
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden text-sm font-medium sm:inline">Back</span>
        </button>

        {/* Source switcher — only shown when there are multiple sources */}
        {sources.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 focus:outline-none">
              <Server className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden text-sm font-medium sm:inline">
                {activeSource.label}
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-black/80 p-1 text-white shadow-xl backdrop-blur-xl">
              <DropdownMenuLabel className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-white/40">
                Sources
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.08]" />
              {sources.map((source, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors data-[focus]:bg-white/10 ${
                    index === activeIndex
                      ? 'text-white'
                      : 'text-white/60 data-[focus]:text-white'
                  }`}>
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {index === activeIndex ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    )}
                  </span>
                  <span className="flex-1">{source.label}</span>
                  {index === activeIndex && (
                    <span className="bg-primary/20 rounded-full px-2 py-0.5 text-[10px] font-medium text-primary">
                      Active
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center">
          <Loading />
        </div>
      )}

      {/* Player iframe */}
      <iframe
        width="100%"
        height="100%"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default EmbedPlayer;
