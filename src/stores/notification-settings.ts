'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationSettingsState {
  notifyNewEpisodes: boolean;
  notifyNewReleases: boolean;
  /** Keys of items already notified — prevents duplicate notifications. */
  notifiedItems: Record<string, boolean>;
  setNotifyNewEpisodes: (value: boolean) => void;
  setNotifyNewReleases: (value: boolean) => void;
  markNotified: (key: string) => void;
  isNotified: (key: string) => boolean;
}

export const useNotificationSettingsStore =
  create<NotificationSettingsState>()(
    persist(
      (set, get) => ({
        notifyNewEpisodes: false,
        notifyNewReleases: false,
        notifiedItems: {},
        setNotifyNewEpisodes: (value) => set({ notifyNewEpisodes: value }),
        setNotifyNewReleases: (value) => set({ notifyNewReleases: value }),
        markNotified: (key) =>
          set({ notifiedItems: { ...get().notifiedItems, [key]: true } }),
        isNotified: (key) => !!get().notifiedItems[key],
      }),
      { name: 'notification-settings' },
    ),
  );
