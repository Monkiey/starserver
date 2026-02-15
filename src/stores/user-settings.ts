'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserSettingsState {
  defaultVideoSource: string;
  defaultCaptionsLanguage: string;
  setDefaultVideoSource: (source: string) => void;
  setDefaultCaptionsLanguage: (language: string) => void;
  reset: () => void;
}

export const DEFAULT_CAPTIONS_LANGUAGE = 'en';
export const CAPTION_LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Japanese', value: 'ja' },
];

const defaultSettings = {
  defaultVideoSource: 'vidsrc',
  defaultCaptionsLanguage: DEFAULT_CAPTIONS_LANGUAGE,
};

export const useUserSettingsStore = create<UserSettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setDefaultVideoSource: (source) => set({ defaultVideoSource: source }),
      setDefaultCaptionsLanguage: (language) =>
        set({ defaultCaptionsLanguage: language }),
      reset: () => set(defaultSettings),
    }),
    { name: 'user-settings' },
  ),
);
