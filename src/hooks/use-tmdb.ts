'use client';

import { createContext, useContext } from 'react';
import { TMDB } from '@lorenzopant/tmdb';

import { env } from '@/env.mjs';

type TmdbContextType = { tmdb: TMDB };

export const TmdbContext = createContext<TmdbContextType | null>(null);

export function useTmdb() {
  const context = useContext(TmdbContext);
  if (!context) {
    const token =
      env.NEXT_PUBLIC_TMDB_TOKEN ?? process.env.NEXT_PUBLIC_TMDB_TOKEN ?? '';
    return new TMDB(token);
  }
  return context.tmdb;
}
