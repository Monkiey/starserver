'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Show } from '@/types';

export type ContinueWatchingItem = Show & {
  updatedAt: number;
};

interface ContinueWatchingState {
  items: ContinueWatchingItem[];
  addItem: (show: Show) => void;
  refreshItem: (id: number, mediaType: Show['media_type']) => void;
  removeItem: (id: number, mediaType: Show['media_type']) => void;
  clear: () => void;
}

const buildItem = (show: Show): ContinueWatchingItem => ({
  ...show,
  updatedAt: Date.now(),
});

export const useContinueWatchingStore = create<ContinueWatchingState>()(
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
          items: [newItem, ...existing].slice(0, 30),
        });
      },
      refreshItem: (id, mediaType) => {
        const item = get().items.find(
          (i) => i.id === id && i.media_type === mediaType,
        );
        if (!item) return;
        const refreshed = { ...item, updatedAt: Date.now() };
        const others = get().items.filter(
          (i) => !(i.id === id && i.media_type === mediaType),
        );
        set({ items: [refreshed, ...others] });
      },
      removeItem: (id, mediaType) =>
        set({
          items: get().items.filter(
            (item) => !(item.id === id && item.media_type === mediaType),
          ),
        }),
      clear: () => set({ items: [] }),
    }),
    { name: 'continue-watching' },
  ),
);
