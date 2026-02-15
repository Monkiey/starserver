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

const defaultSettings = {
  defaultVideoSource: 'vidsrc',
  defaultCaptionsLanguage: 'en',
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
