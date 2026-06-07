'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { useContinueWatchingStore } from '@/stores/continue-watching';
import {
  normalizeOmssServerUrl,
  useStreamingSettingsStore,
} from '@/stores/streaming-settings';
import { MediaType } from '@/types';

interface OmssPlayerProps {
  tmdbId?: string;
  mediaType: MediaType.MOVIE | MediaType.TV;
  season?: string;
  episode?: string;
  showId?: number;
}

type OmssProvider = {
  id?: string;
  name?: string;
};

type OmssSource = {
  id?: string;
  url: string;
  type?: string;
  quality?: string;
  provider?: OmssProvider;
};

type OmssSubtitle = {
  url: string;
  label?: string;
  format?: string;
  language?: string;
};

type OmssResponse = {
  responseId?: string;
  expiresAt?: string;
  sources: OmssSource[];
  subtitles?: OmssSubtitle[];
};

type HlsInstance = {
  loadSource: (url: string) => void;
  attachMedia: (media: HTMLMediaElement) => void;
  destroy: () => void;
};

type HlsConstructor = {
  new (): HlsInstance;
  isSupported: () => boolean;
};

declare global {
  interface Window {
    Hls?: HlsConstructor;
  }
}

let hlsLibraryPromise: Promise<HlsConstructor> | null = null;

const loadHlsLibrary = () => {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }

  hlsLibraryPromise ??= new Promise<HlsConstructor>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-hls-js]',
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.Hls) resolve(window.Hls);
        else
          reject(new Error('HLS player library loaded without exporting Hls.'));
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('Unable to load the HLS player library.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    script.async = true;
    script.dataset.hlsJs = 'true';
    script.onload = () => {
      if (window.Hls) resolve(window.Hls);
      else
        reject(new Error('HLS player library loaded without exporting Hls.'));
    };
    script.onerror = () => {
      reject(new Error('Unable to load the HLS player library.'));
    };
    document.head.appendChild(script);
  });

  return hlsLibraryPromise;
};

const isHlsSource = (source: OmssSource | undefined, url: string) =>
  Boolean(source?.type?.toLowerCase().includes('hls')) || url.includes('.m3u8');

const buildOmssEndpoint = ({
  tmdbId,
  mediaType,
  season,
  episode,
}: OmssPlayerProps) => {
  if (!tmdbId) return null;

  if (mediaType === MediaType.MOVIE) {
    return `/v1/movies/${encodeURIComponent(tmdbId)}`;
  }

  if (!season || !episode) return null;

  return `/v1/tv/${encodeURIComponent(tmdbId)}/seasons/${encodeURIComponent(
    season,
  )}/episodes/${encodeURIComponent(episode)}`;
};

const resolveOmssUrl = (serverUrl: string, url: string) => {
  try {
    return new URL(url, `${normalizeOmssServerUrl(serverUrl)}/`).toString();
  } catch {
    return url;
  }
};

const sourceRank = (source: OmssSource) => {
  const type = source.type?.toLowerCase() ?? '';
  const quality = source.quality?.toLowerCase() ?? '';
  const qualityScore = quality.includes('2160')
    ? 4
    : quality.includes('1080')
    ? 3
    : quality.includes('720')
    ? 2
    : quality.includes('480')
    ? 1
    : 0;

  return (type.includes('hls') ? 10 : 0) + qualityScore;
};

const getSourceLabel = (source: OmssSource, index: number) => {
  const provider =
    source.provider?.name ?? source.provider?.id ?? `Source ${index + 1}`;
  const quality = source.quality ? ` • ${source.quality}` : '';
  const type = source.type ? ` • ${source.type.toUpperCase()}` : '';

  return `${provider}${quality}${type}`;
};

function OmssPlayer({
  tmdbId,
  mediaType,
  season,
  episode,
  showId,
}: OmssPlayerProps) {
  const router = useRouter();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const omssServerUrl = useStreamingSettingsStore(
    (state) => state.omssServerUrl,
  );
  const [data, setData] = React.useState<OmssResponse | null>(null);
  const [selectedSourceIndex, setSelectedSourceIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!showId || !Number.isFinite(showId)) return;

    const saveProgress = () => {
      useContinueWatchingStore.getState().refreshItem(showId, mediaType);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveProgress();
      }
    };

    window.addEventListener('beforeunload', saveProgress);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      saveProgress();
      window.removeEventListener('beforeunload', saveProgress);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showId, mediaType]);

  const endpoint = React.useMemo(
    () => buildOmssEndpoint({ tmdbId, mediaType, season, episode }),
    [episode, mediaType, season, tmdbId],
  );

  const fetchSources = React.useCallback(async () => {
    if (!endpoint) {
      setError('Missing movie or episode information for OMSS playback.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${normalizeOmssServerUrl(omssServerUrl)}${endpoint}`,
        { cache: 'no-store' },
      );

      if (!response.ok) {
        throw new Error(`OMSS source request failed: ${response.status}`);
      }

      const payload = (await response.json()) as OmssResponse;
      const sources = Array.isArray(payload.sources)
        ? [...payload.sources].sort((a, b) => sourceRank(b) - sourceRank(a))
        : [];

      if (!sources.length) {
        throw new Error('The OMSS server did not return any playable sources.');
      }

      setData({ ...payload, sources });
      setSelectedSourceIndex(0);
    } catch (error) {
      setData(null);
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load streams from the configured OMSS server.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, omssServerUrl]);

  React.useEffect(() => {
    void fetchSources();
  }, [fetchSources]);

  const selectedSource = data?.sources[selectedSourceIndex];
  const selectedSourceUrl = selectedSource
    ? resolveOmssUrl(omssServerUrl, selectedSource.url)
    : null;

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedSourceUrl) return;

    let isCancelled = false;
    let hlsInstance: HlsInstance | null = null;

    const startPlayback = () => {
      video.load();
      void video.play().catch(() => {
        // Browsers can block autoplay; controls remain visible for manual playback.
      });
    };

    video.pause();
    video.removeAttribute('src');

    if (isHlsSource(selectedSource, selectedSourceUrl)) {
      const canPlayNativeHls = Boolean(
        video.canPlayType('application/vnd.apple.mpegurl') ||
          video.canPlayType('application/x-mpegURL'),
      );

      if (canPlayNativeHls) {
        video.src = selectedSourceUrl;
        startPlayback();
      } else {
        void loadHlsLibrary()
          .then((Hls) => {
            if (isCancelled) return;

            if (!Hls.isSupported()) {
              video.src = selectedSourceUrl;
              startPlayback();
              return;
            }

            hlsInstance = new Hls();
            hlsInstance.loadSource(selectedSourceUrl);
            hlsInstance.attachMedia(video);
            startPlayback();
          })
          .catch((error) => {
            if (!isCancelled) {
              setError(
                error instanceof Error
                  ? error.message
                  : 'Unable to initialize HLS playback.',
              );
            }
          });
      }
    } else {
      video.src = selectedSourceUrl;
      startPlayback();
    }

    return () => {
      isCancelled = true;
      hlsInstance?.destroy();
    };
  }, [selectedSource, selectedSourceUrl]);

  return (
    <div className="absolute inset-0 bg-black text-white">
      <div className="header-top absolute left-0 right-0 top-8 z-[2] flex h-fit w-fit items-center justify-between gap-x-5 px-4 md:h-20 md:gap-x-8 md:px-10 lg:h-24">
        <div className="flex flex-1 items-center gap-x-5 md:gap-x-8">
          <button
            type="button"
            aria-label="Go back"
            className="h-10 w-10 flex-shrink-0 cursor-pointer transition hover:scale-125"
            onClick={() => router.back()}>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 16 16"
              height="40px"
              width="40px"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"></path>
            </svg>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="absolute inset-0 z-[1] flex h-full w-full items-center justify-center">
          <Loading />
        </div>
      ) : null}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="max-w-lg rounded-2xl border border-white/10 bg-zinc-950/90 p-6 text-center shadow-2xl">
            <h1 className="text-2xl font-semibold">OMSS playback failed</h1>
            <p className="mt-3 text-sm text-zinc-300">{error}</p>
            <p className="mt-2 text-xs text-zinc-500">
              Check Settings and make sure your CinePro/Core server is running.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={() => void fetchSources()}>Retry</Button>
              <Button
                variant="secondary"
                onClick={() => router.push('/settings')}>
                Open settings
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedSourceUrl && !error ? (
        <>
          <video
            ref={videoRef}
            className="h-full w-full bg-black"
            controls
            playsInline
            autoPlay
            crossOrigin="anonymous">
            {data?.subtitles?.map((subtitle, index) => (
              <track
                key={`${subtitle.url}-${index}`}
                src={resolveOmssUrl(omssServerUrl, subtitle.url)}
                kind="subtitles"
                srcLang={subtitle.language ?? `subtitle-${index + 1}`}
                label={subtitle.label ?? `Subtitle ${index + 1}`}
                default={index === 0}
              />
            ))}
          </video>

          {data?.sources && data.sources.length > 1 ? (
            <div className="absolute bottom-20 right-4 z-[2] max-w-xs rounded-xl border border-white/10 bg-zinc-950/80 p-3 backdrop-blur">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                OMSS source
              </label>
              <select
                className="mt-2 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white"
                value={selectedSourceIndex}
                onChange={(event) =>
                  setSelectedSourceIndex(Number(event.target.value))
                }>
                {data.sources.map((source, index) => (
                  <option key={`${source.url}-${index}`} value={index}>
                    {getSourceLabel(source, index)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export default OmssPlayer;
