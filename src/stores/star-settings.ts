'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StarSettingsState {
  // Star feature toggles
  enableStarRecommendations: boolean;

  // Actions
  setStarRecommendations: (enabled: boolean) => void;
  toggleStarRecommendations: () => void;
  resetToDefaults: () => void;
}

export const useStarSettingsStore = create<StarSettingsState>()(
  persist(
    (set) => ({
      // Default: Star recommendations enabled
      enableStarRecommendations: true,

      setStarRecommendations: (enabled) =>
        set({ enableStarRecommendations: enabled }),

      toggleStarRecommendations: () =>
        set((state) => ({
          enableStarRecommendations: !state.enableStarRecommendations,
        })),

      resetToDefaults: () =>
        set({
          enableStarRecommendations: true,
        }),
    }),
    { name: 'star-settings' },
  ),
);
