import type { SourceResponse } from '@omss/sdk';
import type { PlaybackBundle } from '@/types/player.types';
import { mapSource, mapSubtitle } from './source.mapper';
import { getPreferredSource } from '@/components/player/utils/playback';

export function mapPlaybackResponse(response: SourceResponse): PlaybackBundle {
  const sources = response.sources.map(mapSource);
  const subtitles = response.subtitles.map(mapSubtitle);
  const audioTracks = sources.length > 0 ? sources[0].audioTracks : [];

  return {
    sources,
    subtitles,
    audioTracks,
    selectedSource: getPreferredSource(sources),
    selectedSubtitle: subtitles.length > 0 ? subtitles[0] : undefined,
    selectedAudioTrack: audioTracks.length > 0 ? audioTracks[0] : undefined,
  };
}
