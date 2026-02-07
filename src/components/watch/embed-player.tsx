'use client';
import React from 'react';
import Loading from '../ui/loading';
import { useRouter } from 'next/navigation';
import {
  mergeContinueWatchingEntries,
  parseContinueWatchingEntries,
  removeContinueWatchingEntry,
} from '@/lib/continue-watching';
import { MediaType, type ContinueWatchingEntry, type Show } from '@/types';

const PLAYER_HOSTS = ['vidsrc.cc', 'www.vidsrc.cc', 'vidsrc.me', 'www.vidsrc.me'];
const RESUME_THRESHOLD = 10;
const FINISH_BUFFER_SECONDS = 20;

interface EmbedPlayerProps {
  url: string;
  movieId?: string;
  mediaType?: MediaType;
  backdrop?: string;
  title?: string;
  show?: Show;
}

function EmbedPlayer(props: EmbedPlayerProps) {
  const router = useRouter();

  const loadingRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const playbackPositionRef = React.useRef(0);
  const resumeAppliedRef = React.useRef(false);
  const hasRemovedRef = React.useRef(false);
  const durationRef = React.useRef<number | null>(null);
  const [resumeError, setResumeError] = React.useState(false);

  const getNormalizedWatchUrl = React.useCallback(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.delete('t');
    const search = url.searchParams.toString();
    return `${url.pathname}${search ? `?${search}` : ''}`;
  }, []);

  const getResumeFromQuery = React.useCallback(() => {
    if (typeof window === 'undefined') return 0;
    const url = new URL(window.location.href);
    const tParam = url.searchParams.get('t');
    const value = tParam ? Number(tParam) : 0;
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const watchUrl = getNormalizedWatchUrl();
    const existing = parseContinueWatchingEntries(
      localStorage.getItem('continueWatching'),
    );
    const current = existing.find((entry) => entry.watchUrl === watchUrl);
    const resumeFromQuery = getResumeFromQuery();
    if (resumeFromQuery) {
      playbackPositionRef.current = resumeFromQuery;
    } else if (current?.playbackPosition) {
      playbackPositionRef.current = current.playbackPosition;
    }
  }, [getNormalizedWatchUrl, getResumeFromQuery, props.url]);

  React.useEffect(() => {
    if (!props.show) return;
    if (typeof window === 'undefined') return;

    const watchUrl = getNormalizedWatchUrl();
    const existing = parseContinueWatchingEntries(
      localStorage.getItem('continueWatching'),
    );
    const existingEntry = existing.find((item) => item.watchUrl === watchUrl);
    if (existingEntry?.playbackPosition) {
      playbackPositionRef.current = existingEntry.playbackPosition;
    }

    const entry: ContinueWatchingEntry = {
      id: props.show.id,
      media_type: props.show.media_type ?? MediaType.MOVIE,
      title: props.show.title,
      name: props.show.name,
      poster_path: props.show.poster_path,
      backdrop_path: props.show.backdrop_path,
      watchUrl,
      lastWatchedAt: Date.now(),
      playbackPosition: playbackPositionRef.current || undefined,
    };

    const nextEntries = mergeContinueWatchingEntries(
      [entry, ...existing.filter((item) => item.watchUrl !== entry.watchUrl)],
      [],
    );

    localStorage.setItem('continueWatching', JSON.stringify(nextEntries));
  }, [getNormalizedWatchUrl, props.show]);

  const resolveHost = React.useCallback((value: string) => {
    if (!value) return '';
    try {
      return new URL(value).hostname;
    } catch (error) {
      return '';
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = window.setInterval(() => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      if (playbackPositionRef.current <= 0) return;
      if (resumeAppliedRef.current) return;

      const host = resolveHost(iframe.src);
      if (!PLAYER_HOSTS.includes(host)) return;

      const message = JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [Math.floor(playbackPositionRef.current), true],
      });

      try {
        iframe.contentWindow.postMessage(message, '*');
        resumeAppliedRef.current = true;
      } catch (error) {
        resumeAppliedRef.current = true;
        setResumeError(true);
      }
    }, 1200);

    return () => {
      window.clearInterval(interval);
    };
  }, [resolveHost]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = window.setInterval(() => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;

      const host = resolveHost(iframe.src);
      if (!PLAYER_HOSTS.includes(host)) return;

      const message = JSON.stringify({
        event: 'command',
        func: 'getCurrentTime',
        args: [],
      });
      const durationMessage = JSON.stringify({
        event: 'command',
        func: 'getDuration',
        args: [],
        id: 'duration',
      });

      try {
        iframe.contentWindow.postMessage(message, '*');
        if (!durationRef.current) {
          iframe.contentWindow.postMessage(durationMessage, '*');
        }
      } catch (error) {
        return;
      }
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [resolveHost]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMessage = (event: MessageEvent) => {
      const originHost = resolveHost(event.origin);
      if (!PLAYER_HOSTS.includes(originHost))
        return;
      if (!event.data) return;

      try {
        const payload =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        const time =
          typeof payload === 'number'
            ? payload
            : typeof payload?.info === 'number'
              ? payload.info
              : typeof payload?.currentTime === 'number'
                ? payload.currentTime
                : typeof payload?.info?.currentTime === 'number'
                  ? payload.info.currentTime
                  : null;
        const duration =
          typeof payload?.duration === 'number'
            ? payload.duration
            : typeof payload?.info?.duration === 'number'
              ? payload.info.duration
              : typeof payload?.totalTime === 'number'
                ? payload.totalTime
                : typeof payload?.info?.totalTime === 'number'
                  ? payload.info.totalTime
                  : null;
        if (
          duration &&
          Number.isFinite(duration) &&
          (!durationRef.current || durationRef.current !== duration)
        ) {
          durationRef.current = duration;
        }
        if (payload?.id === 'duration' && typeof payload?.info === 'number') {
          durationRef.current = payload.info;
        }
        const ended =
          payload?.ended === true ||
          payload?.info?.ended === true ||
          payload?.event === 'ended';

        if (!time || !Number.isFinite(time)) return;
        if (time < RESUME_THRESHOLD) return;

        playbackPositionRef.current = time;
        const existing = parseContinueWatchingEntries(
          localStorage.getItem('continueWatching'),
        );
        const watchUrl = getNormalizedWatchUrl();
        const entryIndex = existing.findIndex(
          (item) => item.watchUrl === watchUrl,
        );
        if (entryIndex === -1) return;

        const resolvedDuration = duration ?? durationRef.current;
        if (
          !hasRemovedRef.current &&
          (ended ||
            (resolvedDuration &&
              Number.isFinite(resolvedDuration) &&
              time >=
                Math.max(0, resolvedDuration - FINISH_BUFFER_SECONDS)))
        ) {
          const nextEntries = removeContinueWatchingEntry(
            existing,
            watchUrl,
          );
          localStorage.setItem('continueWatching', JSON.stringify(nextEntries));
          hasRemovedRef.current = true;
          return;
        }

        const updated = [...existing];
        updated[entryIndex] = {
          ...updated[entryIndex],
          lastWatchedAt: Date.now(),
          playbackPosition: time,
        };

        localStorage.setItem('continueWatching', JSON.stringify(updated));
      } catch (error) {
        return;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [getNormalizedWatchUrl, resolveHost]);

  const handleIframeLoaded = React.useCallback(() => {
    if (!iframeRef.current) {
      return;
    }
    const iframe: HTMLIFrameElement = iframeRef.current;
    iframe.style.opacity = '1';
    iframe.removeEventListener('load', handleIframeLoaded);
    if (loadingRef.current) loadingRef.current.style.display = 'none';
  }, []);

  React.useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = props.url;
    }

    const iframe: HTMLIFrameElement | null = iframeRef.current;
    iframe?.addEventListener('load', handleIframeLoaded);
    return () => {
      iframe?.removeEventListener('load', handleIframeLoaded);
    };
  }, [handleIframeLoaded, props.url]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${
              props.backdrop ?? '/images/grey-thumbnail.jpg'
            })`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.1),transparent_35%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-14 pt-20 md:px-10 md:pt-28">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 text-white shadow-[0_32px_120px_-60px_rgba(0,0,0,0.9)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="absolute -left-24 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="bg-purple-400/15 absolute -bottom-28 right-0 h-72 w-72 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/5" />
          </div>

          <div className="relative flex flex-col gap-6 p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                aria-label="Go back"
                onClick={() => router.back()}
                className="hover:border-white/35 hover:bg-white/15 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:scale-105">
                <svg
                  className="h-5 w-5"
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"></path>
                </svg>
              </button>
              {props.title ? (
                <div className="border-white/15 flex items-center gap-2 rounded-full border bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
                  <span
                    className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.2)]"
                    aria-hidden
                  />
                  <span>{props.title}</span>
                </div>
              ) : null}
            </div>

            {resumeError ? (
              <div className="border-white/15 rounded-2xl border bg-white/10 px-4 py-3 text-xs text-white/80 backdrop-blur">
                We couldn&apos;t auto-resume this video. Try pressing play, then
                use the timeline scrubber to jump to where you left off.
              </div>
            ) : null}

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-[0_30px_120px_-70px_rgba(0,0,0,0.8)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]" />
              <div className="relative mx-auto aspect-[16/9] w-full overflow-hidden rounded-[22px] border border-white/10">
                <div
                  ref={loadingRef}
                  className="absolute inset-0 z-[1] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <Loading />
                </div>
                <iframe
                  title={props.title ?? 'Embedded player'}
                  width="100%"
                  height="100%"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  sandbox={[
                    'allow-scripts',
                    'allow-same-origin',
                    // Restrict form-driven or popup navigation paths often abused by ad hosts.
                    'allow-presentation',
                  ].join(' ')}
                  allowFullScreen
                  ref={iframeRef}
                  className="absolute inset-0 h-full w-full rounded-[18px] border border-white/10 bg-black/90"
                  style={{ opacity: 0 }}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmbedPlayer;
