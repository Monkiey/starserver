'use client';

import { createContext, useContext, useMemo } from 'react';
import { TMDB } from '@lorenzopant/tmdb';

import { env } from '@/env.mjs';

type TmdbContextType = { tmdb: TMDB };

export const TmdbContext = createContext<TmdbContextType | null>(null);

// Stable singleton for when no provider is present
let _fallbackTmdb: TMDB | null = null;
function getFallbackTmdb(): TMDB {
  if (!_fallbackTmdb) {
    const token =
      env.NEXT_PUBLIC_TMDB_TOKEN ?? process.env.NEXT_PUBLIC_TMDB_TOKEN ?? '';
    _fallbackTmdb = new TMDB(token);
  }
  return _fallbackTmdb;
}

export function useTmdb() {
  const context = useContext(TmdbContext);

  // useMemo as a safety net in case context changes
  const tmdb = useMemo(() => {
    if (context) return context.tmdb;
    return getFallbackTmdb();
  }, [context]);

  return tmdb;
}
