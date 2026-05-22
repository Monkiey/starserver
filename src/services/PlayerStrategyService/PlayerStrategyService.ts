export type PlayerMode = 'embedded' | 'native';

export interface PlayerStrategy {
  mode: PlayerMode;
  url: string;
  reason: string;
}

export class PlayerStrategyService {
  static resolve(url: string): PlayerStrategy {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();

      if (host.endsWith('vidsrc.cc')) {
        return {
          mode: 'embedded',
          url,
          reason: 'Third-party cross-origin host requires iframe embedding.',
        };
      }

      if (parsed.pathname.endsWith('.m3u8')) {
        return {
          mode: 'native',
          url,
          reason:
            'HLS manifest detected; can be handled by native player stack.',
        };
      }

      return {
        mode: 'embedded',
        url,
        reason: 'Defaulting to embedded mode for unknown hosts.',
      };
    } catch {
      return {
        mode: 'embedded',
        url,
        reason: 'Invalid URL; fallback to embedded mode.',
      };
    }
  }
}
