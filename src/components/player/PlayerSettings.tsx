'use client';

import React, { useMemo } from 'react';
import {
  Check,
  Settings,
  Subtitles,
  Volume2,
  HardDrive,
  Gauge,
  Clapperboard,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMediaWatchContext } from './providers/MediaWatchProvider';
import { useSubtitles } from './hooks/useSubtitles';
import { useAudioTracks } from './hooks/useAudioTracks';
import { Badge } from '@/components/ui/badge';
import { normalizeQuality } from '@/lib/strings.utils';

interface PlayerSettingsProps {
  ref?: React.RefObject<HTMLDivElement | null>;
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

export function PlayerSettings({
  playbackRate,
  onPlaybackRateChange,
  qualities,
  currentQuality,
  onQualityChange,
}: PlayerSettingsProps) {
  const { state, selectSource } = useMediaWatchContext();
  const { subtitles, selectedSubtitle, selectSubtitle } = useSubtitles();
  const { audioTracks, selectedAudioTrack, selectAudioTrack } =
    useAudioTracks();

  const sources = useMemo(() => {
    return state.media?.playback.sources
      ? [...state.media.playback.sources].reverse()
      : [];
  }, [state.media?.playback.sources]);

  const selectedSource = state.media?.playback.selectedSource;

  const groupedSources = useMemo(() => {
    return sources.reduce<Record<string, typeof sources>>((acc, source) => {
      const provider = source.provider.name || 'Default Provider';
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push(source);
      return acc;
    }, {});
  }, [sources]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 hover:text-white"
          title="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 border-zinc-800 bg-zinc-950/95 p-3 text-white shadow-2xl backdrop-blur-md">
        <Tabs defaultValue="source" className="w-full">
          <TabsList className="mb-2 grid w-full grid-cols-5 bg-zinc-900/80 p-1">
            <TabsTrigger value="source" title="Source">
              <HardDrive className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="subtitles" title="Subtitles">
              <Subtitles className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="audio" title="Audio">
              <Volume2 className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="quality" title="Quality">
              <Clapperboard className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="speed" title="Speed">
              <Gauge className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-64 pr-2">
            <TabsContent value="source" className="m-0 space-y-3">
              {Object.entries(groupedSources).map(
                ([provider, providerSources]) => (
                  <div key={provider} className="space-y-1">
                    <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {provider}
                    </div>
                    <div className="space-y-1">
                      {providerSources.map((source, idx) => {
                        const isSelected = selectedSource?.url === source.url;
                        return (
                          <button
                            key={`${source.provider.id}-${idx}`}
                            onClick={() => selectSource(source)}
                            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                              isSelected
                                ? 'bg-primary/20 font-medium text-primary'
                                : 'text-zinc-300 hover:bg-zinc-800'
                            }`}>
                            <div className="flex items-center gap-2">
                              <span>Source {idx + 1}</span>
                              <Badge
                                variant="outline"
                                className="border-zinc-700 text-xs text-zinc-400">
                                {normalizeQuality(source.quality)}
                              </Badge>
                            </div>
                            {isSelected && <Check className="h-4 w-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}
            </TabsContent>

            <TabsContent value="subtitles" className="m-0 space-y-1">
              <button
                onClick={() => selectSubtitle(undefined)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  !selectedSubtitle
                    ? 'bg-primary/20 font-medium text-primary'
                    : 'text-zinc-300 hover:bg-zinc-800'
                }`}>
                <span>Off</span>
                {!selectedSubtitle && <Check className="h-4 w-4" />}
              </button>

              {subtitles.map((sub, idx) => {
                const isSelected = selectedSubtitle?.url === sub.url;
                return (
                  <button
                    key={`${sub.url}-${idx}`}
                    onClick={() => selectSubtitle(sub)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary/20 font-medium text-primary'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}>
                    <span>{sub.label}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </TabsContent>

            <TabsContent value="audio" className="m-0 space-y-1">
              {audioTracks.length === 0 ? (
                <div className="p-4 text-center text-sm text-zinc-400">
                  No separate audio tracks available
                </div>
              ) : (
                audioTracks.map((track, idx) => {
                  const isSelected =
                    selectedAudioTrack?.language === track.language;
                  return (
                    <button
                      key={`${track.language}-${idx}`}
                      onClick={() => selectAudioTrack(track)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary/20 font-medium text-primary'
                          : 'text-zinc-300 hover:bg-zinc-800'
                      }`}>
                      <span>{track.label || track.language}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="quality" className="m-0 space-y-1">
              <button
                onClick={() => onQualityChange(-1)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  currentQuality === -1
                    ? 'bg-primary/20 font-medium text-primary'
                    : 'text-zinc-300 hover:bg-zinc-800'
                }`}>
                <span>Auto</span>
                {currentQuality === -1 && <Check className="h-4 w-4" />}
              </button>
              {qualities.map((q) => {
                const isSelected = currentQuality === q.index;
                return (
                  <button
                    key={q.index}
                    onClick={() => onQualityChange(q.index)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary/20 font-medium text-primary'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}>
                    <span>{q.label}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </TabsContent>

            <TabsContent value="speed" className="m-0 space-y-1">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => {
                const isSelected = playbackRate === rate;
                return (
                  <button
                    key={rate}
                    onClick={() => onPlaybackRateChange(rate)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary/20 font-medium text-primary'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}>
                    <span>{rate === 1 ? 'Normal' : `${rate}x`}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
