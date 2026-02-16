'use client';
import React from 'react';
import Loading from '../ui/loading';
import { useRouter } from 'next/navigation';

interface VideoPlayerProps {
  url: string;
}

function VideoPlayer(props: VideoPlayerProps) {
  const router = useRouter();

  const NATIVE_CONTROLS_HEIGHT = 60;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const loadingRef = React.useRef<HTMLDivElement>(null);

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [volume, setVolume] = React.useState(100);
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);
  const [captionsOn, setCaptionsOn] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);

  const volumeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const settingsRef = React.useRef<HTMLDivElement>(null);

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

  const sendMessage = React.useCallback(
    (message: Record<string, unknown>) => {
      if (iframeRef.current?.contentWindow) {
        try {
          const origin = new URL(props.url).origin;
          iframeRef.current.contentWindow.postMessage(message, origin);
        } catch {
          // Invalid URL, skip sending message
        }
      }
    },
    [props.url],
  );

  const toggleMute = React.useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      sendMessage({ type: 'setMuted', value: newMuted });
      return newMuted;
    });
  }, [sendMessage]);

  const handleVolumeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setVolume(val);
      setIsMuted(val === 0);
      sendMessage({ type: 'setVolume', value: val / 100 });
    },
    [sendMessage],
  );

  const toggleCaptions = React.useCallback(() => {
    setCaptionsOn((prev) => {
      const newState = !prev;
      sendMessage({ type: 'setCaptions', value: newState });
      return newState;
    });
  }, [sendMessage]);

  const handleSpeedChange = React.useCallback(
    (speed: number) => {
      setPlaybackSpeed(speed);
      sendMessage({ type: 'setPlaybackSpeed', value: speed });
      setShowSettings(false);
    },
    [sendMessage],
  );

  const togglePip = React.useCallback(() => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {
        // PiP exit not supported
      });
    } else {
      sendMessage({ type: 'requestPictureInPicture' });
    }
  }, [sendMessage]);

  // Close settings menu when clicking outside
  React.useEffect(() => {
    if (!showSettings) return;

    const handleClick = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [showSettings]);

  // Hide volume slider after inactivity
  const startVolumeHideTimer = React.useCallback(() => {
    if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
    volumeTimerRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 2000);
  }, []);

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

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
      {/* Top bar — back button only */}
      <div
        className="absolute left-0 right-0 top-0 z-[3]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
          padding: '16px',
        }}>
        <div className="flex items-center">
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
      </div>

      {/* Bottom bar — advanced controls */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[3]"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
          padding: '12px 16px',
        }}>
        <div className="flex items-center justify-end gap-x-2">
          {/* Volume control */}
          <div
            className="relative flex items-center"
            onMouseEnter={() => {
              if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
              setShowVolumeSlider(true);
            }}
            onMouseLeave={startVolumeHideTimer}>
            <button
              onClick={toggleMute}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted || volume === 0 ? (
                <svg
                  className="h-5 w-5"
                  fill="#fff"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : volume < 50 ? (
                <svg
                  className="h-5 w-5"
                  fill="#fff"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="#fff"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            {showVolumeSlider && (
              <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 items-center rounded-lg bg-black/80 p-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="h-20 w-1 cursor-pointer appearance-none rounded-full bg-white/30 accent-white"
                  style={{
                    writingMode: 'vertical-lr',
                    direction: 'rtl',
                  }}
                  aria-label="Volume"
                />
              </div>
            )}
          </div>

          {/* Captions toggle */}
          <button
            onClick={toggleCaptions}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
              captionsOn
                ? 'bg-white/30 hover:bg-white/40'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            aria-label={captionsOn ? 'Disable captions' : 'Enable captions'}>
            <svg
              className="h-5 w-5"
              fill="#fff"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z" />
            </svg>
          </button>

          {/* Picture-in-Picture */}
          <button
            onClick={togglePip}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label="Picture in picture">
            <svg
              className="h-5 w-5"
              fill="#fff"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
            </svg>
          </button>

          {/* Settings (playback speed) */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings((prev) => !prev)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                showSettings
                  ? 'bg-white/30 hover:bg-white/40'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              aria-label="Settings">
              <svg
                className="h-5 w-5"
                fill="#fff"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
            </button>
            {showSettings && (
              <div className="absolute bottom-12 right-0 min-w-[180px] overflow-hidden rounded-lg bg-black/90 py-1 shadow-lg">
                <div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                  Playback Speed
                </div>
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`flex w-full items-center px-3 py-2 text-sm transition hover:bg-white/10 ${
                      playbackSpeed === speed ? 'text-white' : 'text-white/70'
                    }`}>
                    <span className="mr-2 w-4">
                      {playbackSpeed === speed && '✓'}
                    </span>
                    {speed === 1 ? 'Normal' : `${speed}x`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen toggle */}
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

      {/* Video source — extra height hides the original bottom controls */}
      <iframe
        ref={iframeRef}
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `calc(100% + ${NATIVE_CONTROLS_HEIGHT}px)`,
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
