'use client';

import React, { useEffect, type WheelEventHandler } from 'react';
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Undo,
  Redo,
  PictureInPicture,
  PictureInPicture2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from './utils/time';
import { PlayerSettings } from './PlayerSettings';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number[]) => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number[]) => void;
  onToggleFullscreen: () => void;
  onDivClick: () => void;
  onDoubleClick: () => void;
  onWheel: WheelEventHandler<HTMLDivElement>;
  show: boolean;
  ref?: React.RefObject<HTMLDivElement | null>;
  isPiP: boolean;
  onTogglePiP: () => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;

  qualities: {
    index: number;
    height: number;
    label: string;
  }[];

  currentQuality: number;
  onQualityChange: (level: number) => void;
}

export function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  onTogglePlay,
  onSeek,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen,
  show,
  onDoubleClick,
  onDivClick,
  onWheel,
  ref,
  isPiP,
  onTogglePiP,
  playbackRate,
  onPlaybackRateChange,
  qualities,
  currentQuality,
  onQualityChange,
}: PlayerControlsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();

      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onTogglePlay();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          onSeek([Math.max(0, currentTime - 10)]);
          break;

        case 'ArrowRight':
          e.preventDefault();
          onSeek([Math.min(duration, currentTime + 10)]);
          break;

        case 'ArrowUp':
          e.preventDefault();
          onVolumeChange([Math.min(1, Number((volume + 0.05).toFixed(2)))]);
          break;

        case 'ArrowDown':
          e.preventDefault();
          onVolumeChange([Math.max(0, Number((volume - 0.05).toFixed(2)))]);
          break;

        case 'KeyF':
          e.preventDefault();
          onToggleFullscreen();
          break;

        case 'KeyM':
          e.preventDefault();
          onToggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    currentTime,
    duration,
    volume,
    onTogglePlay,
    onSeek,
    onVolumeChange,
    onToggleFullscreen,
    onToggleMute,
  ]);

  return (
    <div
      className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent px-4 pb-3 pt-1 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={onDivClick}
      onDoubleClick={onDoubleClick}
      onWheel={onWheel}>
      <div
        className="mx-auto w-full space-y-2"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}>
        <div className="group relative py-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={onSeek}
            className="cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSeek([Math.max(0, currentTime - 10)])}
              className="text-white hover:bg-white/20 hover:text-white"
              title="Rewind 10s">
              <Undo width={20} height={20} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onTogglePlay}
              className="text-white hover:bg-white/20 hover:text-white"
              title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="ml-0.5 h-6 w-6 fill-current" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSeek([Math.min(duration, currentTime + 10)])}
              className="text-white hover:bg-white/20 hover:text-white"
              title="Forward 10s">
              <Redo width={20} height={20} />
            </Button>

            <div className="ml-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMute}
                className="text-white hover:bg-white/20 hover:text-white"
                title={isMuted || volume === 0 ? 'Unmute' : 'Mute'}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>

              <div className="w-24">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(v) => onVolumeChange([v[0] / 100])}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="ml-4 text-sm font-medium tabular-nums text-white/90">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PlayerSettings
              ref={ref}
              playbackRate={playbackRate}
              onPlaybackRateChange={onPlaybackRateChange}
              qualities={qualities}
              currentQuality={currentQuality}
              onQualityChange={onQualityChange}
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={onTogglePiP}
              className="text-white hover:bg-white/20 hover:text-white"
              title={isPiP ? 'Exit Picture in Picture' : 'Picture in Picture'}>
              {isPiP ? (
                <PictureInPicture2 className="h-5 w-5" />
              ) : (
                <PictureInPicture className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="text-white hover:bg-white/20 hover:text-white"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
