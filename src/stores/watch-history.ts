'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Show } from '@/types';

export type WatchHistoryItem = Show & {
  watchedAt: number;
};

interface WatchHistoryState {
  items: WatchHistoryItem[];
  addItem: (show: Show) => void;
  clear: () => void;
}

const buildItem = (show: Show): WatchHistoryItem => ({
  ...show,
  watchedAt: Date.now(),
});

export const useWatchHistoryStore = create<WatchHistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (show) => {
        const newItem = buildItem(show);
        const existing = get().items.filter(
          (item) =>
            !(item.id === show.id && item.media_type === show.media_type),
        );
        set({
          items: [newItem, ...existing].slice(0, 100),
        });
      },
      clear: () => set({ items: [] }),
    }),
    { name: 'watch-history' },
  ),
);
