'use client';

import { useEffect, useState, useMemo } from 'react';
import { parseVTT } from './utils/subtitle';

interface CustomSubtitlesProps {
  url: string;
  currentTime: number;
}

export function CustomSubtitles({ url, currentTime }: CustomSubtitlesProps) {
  const [cues, setCues] = useState<
    { start: number; end: number; text: string }[]
  >([]);

  useEffect(() => {
    if (!url) {
      setCues([]);
      return;
    }

    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        const parsed = parseVTT(text);
        setCues(parsed);
      })
      .catch((err) => {
        console.error('Failed to load subtitles:', err);
        setCues([]);
      });
  }, [url]);

  const activeCue = useMemo(() => {
    return cues.find(
      (cue) => currentTime >= cue.start && currentTime <= cue.end,
    );
  }, [cues, currentTime]);

  if (!activeCue) return null;

  const cleanText = activeCue.text.replace(/<[^>]*>/g, '');

  return (
    <div className="pointer-events-none absolute bottom-[15%] left-0 right-0 flex justify-center px-4">
      <div className="rounded bg-black/60 px-4 py-1.5 text-center text-lg font-medium text-white shadow-lg backdrop-blur-sm md:text-2xl">
        {cleanText}
      </div>
    </div>
  );
}
