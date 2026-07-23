'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { usePlayerState } from './hooks/usePlayerState';
import { PlayerControls } from './PlayerControls';
import { LoadingState } from './LoadingState';
import { useEpisodeAutoplay } from './hooks/useEpisodeAutoplay';
import { EpisodeAutoplayOverlay } from './EpisodeAutoplayOverlay';
import { useSubtitles } from './hooks/useSubtitles';
import { CustomSubtitles } from './CustomSubtitles';

export function MediaPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const {
    media,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    setIsPlaying,
    setIsLoading,
    setCurrentTime,
    setDuration,
    setVolume,
    setIsMuted,
    setError,
  } = usePlayerState();

  const { handleEpisodeEnded } = useEpisodeAutoplay();
  const { selectedSubtitle } = useSubtitles();

  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAutoplay, setShowAutoplay] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [qualities, setQualities] = useState<
    {
      index: number;
      height: number;
      label: string;
    }[]
  >([]);

  const [currentQuality, setCurrentQuality] = useState(-1);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedSource = media?.playback.selectedSource;

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Initialize HLS or Native Video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedSource) return;

    setIsLoading(true);

    if (selectedSource.type === 'hls' || selectedSource.url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls.loadSource(selectedSource.url);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isPlayingRef.current) {
            void video.play().catch(() => setIsPlaying(false));
          }
          const levels = hls.levels.map((level, index) => ({
            index,
            height: level.height,
            label: `${level.height}p`,
          }));

          setQualities(levels);
          setIsLoading(false);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setError(`HLS Fatal Error: ${data.type}`);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = selectedSource.url;
      }
    } else {
      video.src = selectedSource.url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedSource, setError, setIsLoading, setIsPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => setIsPiP(true);
    const handleLeavePiP = () => setIsPiP(false);

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (media?.type === 'tv' && media.episodeNumber !== undefined) {
      setShowAutoplay(true);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSeek = (val: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = val[0];
      setCurrentTime(val[0]);
    }
  };

  const togglePictureInPicture = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.pictureInPictureElement) {
      void document
        .exitPictureInPicture()
        .then(() => setIsPiP(false))
        .catch(console.error);
    } else {
      void video
        .requestPictureInPicture()
        .then(() => setIsPiP(true))
        .catch(console.error);
    }
  };

  const handleQualityChange = (level: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = level;
    setCurrentQuality(level);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const handleVolumeChange = (val: number[]) => {
    setVolume(val[0]);
    if (val[0] === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      void containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(console.error);
    } else {
      void document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(console.error);
    }
  };

  if (!selectedSource) {
    return (
      <LoadingState
        message={
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-lg font-semibold">
              Resolving media sources...
            </span>
            <span className="text-sm text-zinc-400">
              Fetching available streams and subtitle tracks
            </span>
          </div>
        }
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="group relative h-screen w-full overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}>
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onClick={togglePlay}
        preload="auto"
        crossOrigin="anonymous"
        poster={
          media?.backdropUrl
            ? `https://image.tmdb.org/t/p/original${media.backdropUrl}`
            : undefined
        }
        playsInline
      />

      {selectedSubtitle && (
        <CustomSubtitles url={selectedSubtitle.url} currentTime={currentTime} />
      )}

      {isLoading && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <LoadingState message="Buffering stream..." />
        </div>
      )}

      <PlayerControls
        isPlaying={isPlaying}
        onDoubleClick={toggleFullscreen}
        onWheel={(e: React.WheelEvent<HTMLDivElement>) => {
          const delta = -e.deltaY * 0.001;
          const newVolume = Math.max(0, Math.min(1, volume + delta));
          setVolume(newVolume);
          if (newVolume === 0) {
            setIsMuted(true);
          } else if (isMuted) {
            setIsMuted(false);
          }
        }}
        currentTime={currentTime}
        onDivClick={togglePlay}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        onTogglePlay={togglePlay}
        onSeek={handleSeek}
        onToggleMute={toggleMute}
        onVolumeChange={handleVolumeChange}
        onToggleFullscreen={toggleFullscreen}
        show={showControls || !isPlaying}
        ref={containerRef}
        isPiP={isPiP}
        onTogglePiP={togglePictureInPicture}
        playbackRate={playbackRate}
        onPlaybackRateChange={setPlaybackRate}
        qualities={qualities}
        currentQuality={currentQuality}
        onQualityChange={handleQualityChange}
      />

      <EpisodeAutoplayOverlay
        show={showAutoplay}
        onNext={() => {
          setShowAutoplay(false);
          void handleEpisodeEnded();
        }}
        onCancel={() => setShowAutoplay(false)}
      />
    </div>
  );
}
