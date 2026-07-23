export const PLAYBACK_CONSTANTS = {
  AUTOPLAY_NEXT_DELAY: 5000,
  SEEK_STEP: 10,
  DEFAULT_VOLUME: 1,
  THUMBNAIL_INTERVAL: 10,
} as const;

export const SOURCE_TYPES = {
  HLS: 'hls',
  DASH: 'dash',
  MP4: 'mp4',
  MKV: 'mkv',
  WEBM: 'webm',
  HTTP: 'http',
} as const;
