'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Show } from '@/types';

interface WatchlistState {
  items: Show[];
  addItem: (show: Show) => void;
  removeItem: (id: number, mediaType: Show['media_type']) => void;
  isInWatchlist: (id: number, mediaType: Show['media_type']) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (show) => {
        const existing = get().items.some(
          (item) => item.id === show.id && item.media_type === show.media_type,
        );
        if (!existing) {
          set({ items: [show, ...get().items] });
        }
      },
      removeItem: (id, mediaType) =>
        set({
          items: get().items.filter(
            (item) => !(item.id === id && item.media_type === mediaType),
          ),
        }),
      isInWatchlist: (id, mediaType) =>
        get().items.some(
          (item) => item.id === id && item.media_type === mediaType,
        ),
    }),
    { name: 'watchlist' },
  ),
);
