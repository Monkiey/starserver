'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StarSettingsState {
  // Star feature toggles
  enableStarRecommendations: boolean;
  enableStarPromptSearch: boolean;
  enableStarSearch: boolean;

  // Actions
  setStarRecommendations: (enabled: boolean) => void;
  setStarPromptSearch: (enabled: boolean) => void;
  setStarSearch: (enabled: boolean) => void;
  toggleStarRecommendations: () => void;
  toggleStarPromptSearch: () => void;
  toggleStarSearch: () => void;
  resetToDefaults: () => void;
}

export const useStarSettingsStore = create<StarSettingsState>()(
  persist(
    (set) => ({
      // Default: all Star features enabled
      enableStarRecommendations: true,
      enableStarPromptSearch: true,
      enableStarSearch: true,

      setStarRecommendations: (enabled) =>
        set({ enableStarRecommendations: enabled }),
      setStarPromptSearch: (enabled) =>
        set({ enableStarPromptSearch: enabled }),
      setStarSearch: (enabled) => set({ enableStarSearch: enabled }),

      toggleStarRecommendations: () =>
        set((state) => ({
          enableStarRecommendations: !state.enableStarRecommendations,
        })),
      toggleStarPromptSearch: () =>
        set((state) => ({
          enableStarPromptSearch: !state.enableStarPromptSearch,
        })),
      toggleStarSearch: () =>
        set((state) => ({
          enableStarSearch: !state.enableStarSearch,
        })),

      resetToDefaults: () =>
        set({
          enableStarRecommendations: true,
          enableStarPromptSearch: true,
          enableStarSearch: true,
        }),
    }),
    { name: 'star-settings' },
  ),
);
