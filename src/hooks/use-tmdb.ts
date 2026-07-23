'use client';

import { createContext, useContext } from 'react';
import { TMDB } from '@lorenzopant/tmdb';

type TmdbContextType = { tmdb: TMDB };

export const TmdbContext = createContext<TmdbContextType | null>(null);

export function useTmdb() {
  const context = useContext(TmdbContext);
  if (!context) {
    // Return a default TMDB instance with environment or fallback key if provider not wrapped
    const apiKey =
      process.env.NEXT_PUBLIC_TMDB_API_KEY ??
      '4f4b279ca355d27d9266ddc9944f404c';
    return new TMDB(apiKey);
  }
  return context.tmdb;
}
