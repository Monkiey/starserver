'use client';

import React from 'react';
import { useWatchlistStore } from '@/stores/watchlist';
import { useNotificationSettingsStore } from '@/stores/notification-settings';
import NotificationService from '@/services/NotificationService';

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export function useNotificationChecker() {
  const { items } = useWatchlistStore();
  const { notifyNewEpisodes, notifyNewReleases, isNotified, markNotified } =
    useNotificationSettingsStore();

  const check = React.useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    if (!notifyNewEpisodes && !notifyNewReleases) return;
    if (!items.length) return;

    for (const show of items) {
      try {
        const key = await NotificationService.checkItem(show, {
          notifyNewEpisodes,
          notifyNewReleases,
          isNotified,
        });
        if (key) {
          markNotified(key);
        }
      } catch {
        // Silently ignore per-item failures so one bad item doesn't block others.
      }
    }
  }, [items, notifyNewEpisodes, notifyNewReleases, isNotified, markNotified]);

  React.useEffect(() => {
    void check();
    const interval = setInterval(() => void check(), CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [check]);
}
