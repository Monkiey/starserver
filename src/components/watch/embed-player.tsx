'use client';
import React from 'react';
import Loading from '../ui/loading';
import { useRouter } from 'next/navigation';

interface EmbedPlayerProps {
  url: string;
}

// Document Picture-in-Picture API types (not yet in standard lib.dom.d.ts)
interface DocumentPictureInPicture {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
  readonly window: Window | null;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

function EmbedPlayer(props: EmbedPlayerProps) {
  const router = useRouter();

  const loadingRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const playerContainerRef = React.useRef<HTMLDivElement>(null);
  const [isPiP, setIsPiP] = React.useState(false);
  const [supportsPiP, setSupportsPiP] = React.useState(false);

  React.useEffect(() => {
    setSupportsPiP('documentPictureInPicture' in window);
  }, []);

  const handleIframeLoaded = React.useCallback(() => {
    if (!iframeRef.current) {
      return;
    }
    const iframe: HTMLIFrameElement = iframeRef.current;
    if (iframe) {
      iframe.style.opacity = '1';
      iframe.removeEventListener('load', handleIframeLoaded);
      if (loadingRef.current) loadingRef.current.style.display = 'none';
    }
  }, []);

  React.useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = props.url;
    }

    const { current } = iframeRef;
    const iframe: HTMLIFrameElement | null = current;
    iframe?.addEventListener('load', handleIframeLoaded);
    return () => {
      iframe?.removeEventListener('load', handleIframeLoaded);
    };
  }, [handleIframeLoaded, props.url]);

  // Close PiP window when the component unmounts
  React.useEffect(() => {
    return () => {
      if (window.documentPictureInPicture?.window) {
        window.documentPictureInPicture.window.close();
      }
    };
  }, []);

  const handlePiP = React.useCallback(async () => {
    if (!iframeRef.current || !window.documentPictureInPicture) return;

    if (isPiP) {
      window.documentPictureInPicture.window?.close();
      return;
    }

    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 640,
        height: 360,
      });

      // Style the PiP window body
      pipWindow.document.documentElement.style.cssText =
        'background:#000;margin:0;padding:0;height:100%;width:100%;';
      pipWindow.document.body.style.cssText =
        'margin:0;padding:0;height:100%;width:100%;overflow:hidden;';

      // Move the iframe into the PiP window
      pipWindow.document.body.appendChild(iframeRef.current);
      setIsPiP(true);

      // Restore iframe to original container when PiP closes
      pipWindow.addEventListener('pagehide', () => {
        if (iframeRef.current && playerContainerRef.current) {
          playerContainerRef.current.appendChild(iframeRef.current);
        }
        setIsPiP(false);
      });
    } catch {
      // PiP request was rejected or not supported in this context
    }
  }, [isPiP]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: '#000',
      }}>
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
        {supportsPiP && (
          <button
            onClick={() => void handlePiP()}
            className="flex items-center justify-center rounded-full p-2 text-white transition hover:scale-110 hover:bg-white/20"
            title={isPiP ? 'Exit Picture-in-Picture' : 'Picture-in-Picture'}
            aria-label={
              isPiP ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'
            }>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6">
              {isPiP ? (
                <>
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                  <polyline points="17 2 22 2 22 7" />
                  <line x1="12" y1="12" x2="22" y2="2" />
                </>
              ) : (
                <>
                  <rect x="2" y="2" width="20" height="15" rx="2" ry="2" />
                  <rect x="13" y="11" width="8" height="5" rx="1" ry="1" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>
      <div
        ref={loadingRef}
        className="absolute z-[1] flex h-full w-full items-center justify-center">
        <Loading />
      </div>
      <div ref={playerContainerRef} style={{ width: '100%', height: '100%' }}>
        <iframe
          width="100%"
          height="100%"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          ref={iframeRef}
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox"
          style={{ opacity: 0 }}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

export default EmbedPlayer;
