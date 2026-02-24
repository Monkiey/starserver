'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationSettingsState {
  notifyNewEpisodes: boolean;
  notifyNewReleases: boolean;
  setNotifyNewEpisodes: (value: boolean) => void;
  setNotifyNewReleases: (value: boolean) => void;
}

export const useNotificationSettingsStore =
  create<NotificationSettingsState>()(
    persist(
      (set) => ({
        notifyNewEpisodes: false,
        notifyNewReleases: false,
        setNotifyNewEpisodes: (value) => set({ notifyNewEpisodes: value }),
        setNotifyNewReleases: (value) => set({ notifyNewReleases: value }),
      }),
      { name: 'notification-settings' },
    ),
  );
