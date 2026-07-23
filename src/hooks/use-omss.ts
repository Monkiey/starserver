'use client';

import { useContext } from 'react';
import { OmssContext } from '@/providers/omss-provider';
import { createOmssClient } from '@omss/sdk';
import { DEFAULT_OMSS_SERVER_URL } from '@/stores/streaming-settings';

export function useOmss() {
  const ctx = useContext(OmssContext);
  if (!ctx) {
    const client = createOmssClient({ baseUrl: DEFAULT_OMSS_SERVER_URL });
    return {
      client,
      baseUrl: DEFAULT_OMSS_SERVER_URL,
      setBaseUrl: () => undefined,
      valid: true,
    };
  }
  return ctx;
}
