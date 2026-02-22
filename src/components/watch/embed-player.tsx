'use client';
import React from 'react';
import Loading from '../ui/loading';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface EmbedPlayerProps {
  url: string;
}

function EmbedPlayer({ url }: EmbedPlayerProps) {
  const router = useRouter();

  const [isLoaded, setIsLoaded] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleIframeLoaded = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    setIsLoaded(false);
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.src = url;
      iframe.addEventListener('load', handleIframeLoaded);
      return () => iframe.removeEventListener('load', handleIframeLoaded);
    }
  }, [url, handleIframeLoaded]);

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
      <div className="absolute inset-x-0 top-0 z-[4] flex items-center px-4 py-4 md:px-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20">
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden text-sm font-medium sm:inline">Back</span>
        </button>
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
