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
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const loadingRef = React.useRef<HTMLDivElement>(null);
  const controlsRef = React.useRef<HTMLDivElement>(null);
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);

  const handleIframeLoaded = React.useCallback(() => {
    setIsLoaded(true);
    if (loadingRef.current) loadingRef.current.style.display = 'none';
  }, []);

  React.useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = props.url;
    }

    const iframe = iframeRef.current;
    iframe?.addEventListener('load', handleIframeLoaded);
    return () => {
      iframe?.removeEventListener('load', handleIframeLoaded);
    };
  }, [handleIframeLoaded, props.url]);

  const resetHideTimer = React.useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  React.useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [resetHideTimer]);

  const handleMouseMove = React.useCallback(() => {
    resetHideTimer();
  }, [resetHideTimer]);

  const toggleFullscreen = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      void container.requestFullscreen();
    } else {
      void document.exitFullscreen();
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
      onMouseMove={handleMouseMove}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: '#000',
        overflow: 'hidden',
      }}>
      {/* Top controls bar */}
      <div
        ref={controlsRef}
        className={`absolute left-0 right-0 top-0 z-[3] transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
          padding: '16px',
        }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            {/* Back button */}
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
          </div>
          <div className="flex items-center gap-x-3">
            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label={
                isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
              }>
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
      </div>

      {/* Loading spinner */}
      <div
        ref={loadingRef}
        className="absolute z-[2] flex h-full w-full items-center justify-center"
        style={{ display: isLoaded ? 'none' : 'flex' }}>
        <Loading />
      </div>

      {/* Video source */}
      <iframe
        ref={iframeRef}
        width="100%"
        height="100%"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
          border: 'none',
        }}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default VideoPlayer;
