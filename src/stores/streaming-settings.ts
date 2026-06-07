'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const DEFAULT_OMSS_SERVER_URL = 'http://localhost:3000';

interface StreamingSettingsState {
  omssServerUrl: string;
  setOmssServerUrl: (url: string) => void;
}

export const normalizeOmssServerUrl = (url: string): string => {
  const trimmed = url.trim().replace(/\/+$/, '');

  if (!trimmed) {
    return DEFAULT_OMSS_SERVER_URL;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.hostname === '0.0.0.0') {
      parsed.hostname = 'localhost';
    }

    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return trimmed;
  }
};

export const useStreamingSettingsStore = create<StreamingSettingsState>()(
  persist(
    (set) => ({
      omssServerUrl: DEFAULT_OMSS_SERVER_URL,
      setOmssServerUrl: (url) =>
        set({ omssServerUrl: normalizeOmssServerUrl(url) }),
    }),
    { name: 'streaming-settings' },
  ),
);
