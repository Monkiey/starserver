'use client';
import React from 'react';
import Loading from '../ui/loading';
import { useRouter } from 'next/navigation';

interface VideoPlayerProps {
  url: string;
}

function VideoPlayer(props: VideoPlayerProps) {
  const router = useRouter();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<HTMLDivElement>(null);
  const loadingRef = React.useRef<HTMLDivElement>(null);

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [retryKey, setRetryKey] = React.useState(0);

  // Fetch the proxied HTML and inject it via srcdoc
  React.useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    const proxyUrl = `/api/proxy?url=${encodeURIComponent(props.url)}`;

    fetch(proxyUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
        return res.text();
      })
      .then((html) => {
        if (!playerRef.current) return;

        // Clear previous content properly
        while (playerRef.current.firstChild) {
          playerRef.current.removeChild(playerRef.current.firstChild);
        }

        // Create a sandboxed iframe with srcdoc (content loaded via server proxy, not embedded from external URL)
        const frame = document.createElement('iframe');
        frame.srcdoc = html;
        frame.style.cssText =
          'width:100%;height:100%;border:none;position:absolute;top:0;left:0;';
        frame.setAttribute('allowfullscreen', '');
        frame.setAttribute(
          'allow',
          'autoplay; fullscreen; picture-in-picture; encrypted-media',
        );
        // Note: allow-scripts + allow-same-origin is required for the embedded
        // player's scripts to load external resources. The proxy allowlist
        // (vidsrc.cc only) limits what content can be loaded.
        frame.setAttribute(
          'sandbox',
          'allow-scripts allow-same-origin allow-forms allow-presentation',
        );

        frame.addEventListener('load', () => {
          setIsLoaded(true);
          if (loadingRef.current) loadingRef.current.style.display = 'none';
        });

        playerRef.current.appendChild(frame);
      })
      .catch(() => {
        setHasError(true);
        setIsLoaded(true);
        if (loadingRef.current) loadingRef.current.style.display = 'none';
      });
  }, [props.url, retryKey]);

  const toggleFullscreen = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {
        // Fullscreen not supported or denied
      });
    } else {
      document.exitFullscreen().catch(() => {
        // Exit fullscreen failed
      });
    }
  }, []);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: '#000',
        overflow: 'hidden',
      }}>
      {/* Top bar — back button and fullscreen */}
      <div
        className="absolute left-0 right-0 top-0 z-[3]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
          padding: '16px',
        }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label="Go back">
            <svg
              className="h-5 w-5"
              stroke="#fff"
              fill="#fff"
              strokeWidth="0"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
            {isFullscreen ? (
              <svg
                className="h-5 w-5"
                fill="#fff"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="#fff"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Loading spinner */}
      <div
        ref={loadingRef}
        className="absolute z-[2] flex h-full w-full items-center justify-center"
        style={{ display: isLoaded ? 'none' : 'flex' }}>
        <Loading />
      </div>

      {/* Error state */}
      {hasError && (
        <div className="absolute z-[2] flex h-full w-full flex-col items-center justify-center gap-4 text-white">
          <svg
            className="h-12 w-12 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="text-lg text-white/80">Failed to load video</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20">
            Try again
          </button>
        </div>
      )}

      {/* Player container — proxied content injected here */}
      <div
        ref={playerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

export default VideoPlayer;
