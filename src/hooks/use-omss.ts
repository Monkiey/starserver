'use client';

import { useContext, useMemo } from 'react';
import { OmssContext } from '@/providers/omss-provider';
import { createOmssClient } from '@omss/sdk';
import { DEFAULT_OMSS_SERVER_URL } from '@/stores/streaming-settings';

// Stable singleton for when no OmssProvider is present
let _fallbackClient: ReturnType<typeof createOmssClient> | null = null;
function getFallbackClient() {
  if (!_fallbackClient) {
    _fallbackClient = createOmssClient({ baseUrl: DEFAULT_OMSS_SERVER_URL });
  }
  return _fallbackClient;
}

const FALLBACK_VALUE = {
  baseUrl: DEFAULT_OMSS_SERVER_URL,
  setBaseUrl: () => undefined,
  valid: true,
} as const;

export function useOmss() {
  const ctx = useContext(OmssContext);

  return useMemo(() => {
    if (ctx) return ctx;
    return {
      client: getFallbackClient(),
      ...FALLBACK_VALUE,
    };
  }, [ctx]);
}
