'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DEFAULT_OMSS_SERVER_URL,
  normalizeOmssServerUrl,
  useStreamingSettingsStore,
} from '@/stores/streaming-settings';

const TIMEOUT_MS = 5000;

type ConnectionState = 'idle' | 'checking' | 'connected' | 'error';

function connectionLabel(status: ConnectionState) {
  switch (status) {
    case 'checking':
      return 'Checking...';
    case 'connected':
      return 'Connected!';
    case 'error':
      return 'Not connected';
    default:
      return 'Configured';
  }
}

function connectionClassName(status: ConnectionState) {
  switch (status) {
    case 'connected':
      return 'bg-green-500 text-white';
    case 'checking':
      return 'bg-yellow-500 text-black';
    case 'error':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

async function checkOmssConnection(serverUrl: string) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `${normalizeOmssServerUrl(serverUrl)}/v1/health`,
      {
        cache: 'no-store',
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(`OMSS health check failed: ${response.status}`);
    }

    const payload = (await response.json()) as {
      spec?: string;
      status?: string;
    };

    if (payload.spec !== 'omss') {
      throw new Error('The configured backend did not identify as OMSS.');
    }

    return payload.status ?? 'operational';
  } finally {
    window.clearTimeout(timeout);
  }
}

export default function OmssServerSettings() {
  const storedUrl = useStreamingSettingsStore((state) => state.omssServerUrl);
  const setStoredUrl = useStreamingSettingsStore(
    (state) => state.setOmssServerUrl,
  );
  const [url, setUrl] = React.useState(DEFAULT_OMSS_SERVER_URL);
  const [status, setStatus] = React.useState<ConnectionState>('idle');
  const [message, setMessage] = React.useState(
    'Set the CinePro/Core or OMSS-compatible backend used to resolve streams.',
  );

  React.useEffect(() => {
    setUrl(storedUrl);
  }, [storedUrl]);

  const saveAndCheck = React.useCallback(async () => {
    const normalizedUrl = normalizeOmssServerUrl(url);
    setStoredUrl(normalizedUrl);
    setUrl(normalizedUrl);
    setStatus('checking');
    setMessage('Checking OMSS health endpoint...');

    try {
      const backendStatus = await checkOmssConnection(normalizedUrl);
      setStatus('connected');
      setMessage(`OMSS server is ${backendStatus}.`);
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to connect to the configured OMSS server.',
      );
    }
  }, [setStoredUrl, url]);

  React.useEffect(() => {
    void saveAndCheck();
    // Only run the initial health probe after hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            OMSS Server (CinePro/Core)
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Streaming backend configuration
          </p>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${connectionClassName(
            status,
          )}`}>
          {connectionLabel(status)}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        <label className="text-sm font-semibold" htmlFor="omss-server-url">
          OMSS (CinePro/Core) API URL
        </label>
        <p className="text-sm text-muted-foreground">
          Use a running OMSS server such as CinePro/Core. If you enter{' '}
          <code className="rounded bg-muted px-1 py-0.5">0.0.0.0</code>, the app
          will connect through{' '}
          <code className="rounded bg-muted px-1 py-0.5">localhost</code> in the
          browser.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="omss-server-url"
            inputMode="url"
            placeholder={DEFAULT_OMSS_SERVER_URL}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void saveAndCheck();
              }
            }}
          />
          <Button
            onClick={() => void saveAndCheck()}
            disabled={status === 'checking'}>
            Save
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
