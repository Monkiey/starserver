export const playbackService = {
  saveProgress: (id: string, time: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`playback_progress_${id}`, time.toString());
    }
  },

  getProgress: (id: string): number => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`playback_progress_${id}`);
      return saved ? parseFloat(saved) : 0;
    }
    return 0;
  },
};
