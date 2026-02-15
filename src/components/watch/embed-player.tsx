'use client';
import React from 'react';
import Loading from '../ui/loading';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_VIDEO_SOURCE,
  useUserSettingsStore,
} from '@/stores/user-settings';

interface EmbedPlayerProps {
  url: string;
}

// VidSrc embed supports provider selection via `source` query param.
// Keep all providers pointing to the VidSrc host unless we add bespoke bases.
const VIDEO_SOURCE_BASE_URLS: Record<string, string> = {
  [DEFAULT_VIDEO_SOURCE]: 'https://vidsrc.cc',
  vidplay: 'https://vidsrc.cc', // shares VidSrc host; provider chosen via `source`
  upcloud: 'https://vidsrc.cc', // shares VidSrc host; provider chosen via `source`
};

function EmbedPlayer(props: EmbedPlayerProps) {
  const router = useRouter();
  const { defaultVideoSource, defaultCaptionsLanguage } =
    useUserSettingsStore();

  const loadingRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const resolvedUrl = React.useMemo(() => {
    const baseUrl =
      VIDEO_SOURCE_BASE_URLS[defaultVideoSource] ??
      VIDEO_SOURCE_BASE_URLS[DEFAULT_VIDEO_SOURCE];

    try {
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      // Keep normalization defensive in case callers pass paths without a leading slash.
      const normalizedPath = props.url.startsWith('/')
        ? props.url
        : `/${props.url}`;
      const targetUrl = new URL(normalizedPath, normalizedBase);
      if (defaultVideoSource !== DEFAULT_VIDEO_SOURCE) {
        targetUrl.searchParams.set('source', defaultVideoSource);
      }
      if (defaultCaptionsLanguage) {
        targetUrl.searchParams.set('cc_lang', defaultCaptionsLanguage);
      }
      return targetUrl.toString();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(
        'Unable to build embed URL, falling back to raw value.',
        error,
      );
      return props.url;
    }
  }, [defaultCaptionsLanguage, defaultVideoSource, props.url]);

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
      iframeRef.current.src = resolvedUrl;
    }

    const { current } = iframeRef;
    const iframe: HTMLIFrameElement | null = current;
    iframe?.addEventListener('load', handleIframeLoaded);
    return () => {
      iframe?.removeEventListener('load', handleIframeLoaded);
    };
  }, [handleIframeLoaded, resolvedUrl]);

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
      </div>
      <div
        ref={loadingRef}
        className="absolute z-[1] flex h-full w-full items-center justify-center">
        <Loading />
      </div>
      <iframe
        width="100%"
        height="100%"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        style={{ opacity: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default EmbedPlayer;
