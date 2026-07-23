'use client';

import React, { createContext, useEffect, useMemo, useState } from 'react';
import { createOmssClient, type OmssClient } from '@omss/sdk';
import {
  useStreamingSettingsStore,
  DEFAULT_OMSS_SERVER_URL,
} from '@/stores/streaming-settings';

type OmssContextType = {
  client: OmssClient;
  baseUrl: string;
  setBaseUrl: (baseUrl: string) => void;
  valid: boolean;
};

const OmssContext = createContext<OmssContextType | null>(null);

export function OmssProvider({ children }: { children: React.ReactNode }) {
  const { omssServerUrl, setOmssServerUrl } = useStreamingSettingsStore();
  const [valid, setValid] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlFromQuery = params.get('omssurl');

    if (urlFromQuery) {
      setOmssServerUrl(urlFromQuery);
      params.delete('omssurl');
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '') +
        window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
  }, [setOmssServerUrl]);

  const baseUrl = omssServerUrl || DEFAULT_OMSS_SERVER_URL;

  const client = useMemo(() => {
    return createOmssClient({
      baseUrl,
    });
  }, [baseUrl]);

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      try {
        const result = await client.getHealthStatus();
        const health = result.data;
        const isValid =
          health?.spec === 'omss' && health?.status === 'operational';

        if (!cancelled) {
          setValid(isValid);
        }
      } catch {
        if (!cancelled) {
          // If health check fails or endpoint isn't strict, keep operational fallback
          setValid(true);
        }
      }
    }

    void validate();

    return () => {
      cancelled = true;
    };
  }, [client]);

  const value = useMemo(
    () => ({
      client,
      baseUrl,
      setBaseUrl: setOmssServerUrl,
      valid,
    }),
    [client, baseUrl, setOmssServerUrl, valid],
  );

  return <OmssContext.Provider value={value}>{children}</OmssContext.Provider>;
}

export { OmssContext };
