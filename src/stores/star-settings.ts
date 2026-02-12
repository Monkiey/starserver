'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StarSettingsState {
  // Star feature toggles
  enableStarRecommendations: boolean;
  enableStarPromptSearch: boolean;

  // Actions
  setStarRecommendations: (enabled: boolean) => void;
  setStarPromptSearch: (enabled: boolean) => void;
  toggleStarRecommendations: () => void;
  toggleStarPromptSearch: () => void;
  resetToDefaults: () => void;
}

export const useStarSettingsStore = create<StarSettingsState>()(
  persist(
    (set) => ({
      // Default: all Star features enabled
      enableStarRecommendations: true,
      enableStarPromptSearch: true,

      setStarRecommendations: (enabled) =>
        set({ enableStarRecommendations: enabled }),
      setStarPromptSearch: (enabled) =>
        set({ enableStarPromptSearch: enabled }),

      toggleStarRecommendations: () =>
        set((state) => ({
          enableStarRecommendations: !state.enableStarRecommendations,
        })),
      toggleStarPromptSearch: () =>
        set((state) => ({
          enableStarPromptSearch: !state.enableStarPromptSearch,
        })),

      resetToDefaults: () =>
        set({
          enableStarRecommendations: true,
          enableStarPromptSearch: true,
        }),
    }),
    { name: 'star-settings' },
  ),
);
