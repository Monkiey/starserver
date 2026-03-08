'use client';

import * as React from 'react';
import { Download, Chrome, Globe, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Browser = 'chrome' | 'safari' | 'firefox' | 'edge' | 'other';

function detectBrowser(): Browser {
  if (typeof window === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'edge';
  if (/Chrome\//.test(ua)) return 'chrome';
  if (/Firefox\//.test(ua)) return 'firefox';
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'safari';
  return 'other';
}

const STEPS: Record<
  Browser,
  { label: string; steps: string[]; note?: string }
> = {
  chrome: {
    label: 'Chrome',
    steps: [
      'Click "Download Extension" to save the ZIP file.',
      "Unzip the downloaded file — you'll get a folder called starserver-extension.",
      'Open Chrome and go to chrome://extensions.',
      'Enable Developer mode (toggle in the top-right corner).',
      'Click "Load unpacked" and select the unzipped folder.',
      'The StarServer icon will appear in your toolbar — pin it for easy access.',
    ],
  },
  edge: {
    label: 'Edge',
    steps: [
      'Click "Download Extension" to save the ZIP file.',
      "Unzip the downloaded file — you'll get a folder called starserver-extension.",
      'Open Edge and go to edge://extensions.',
      'Enable Developer mode (toggle in the left sidebar).',
      'Click "Load unpacked" and select the unzipped folder.',
      'The StarServer icon will appear in your toolbar — pin it for easy access.',
    ],
  },
  firefox: {
    label: 'Firefox',
    steps: [
      'Click "Download Extension" to save the ZIP file.',
      "Unzip the downloaded file — you'll get a folder called starserver-extension.",
      'Open Firefox and go to about:debugging#/runtime/this-firefox.',
      'Click "Load Temporary Add-on…".',
      'Open the unzipped folder and select any file inside it.',
      'The StarServer icon will appear in your toolbar.',
    ],
    note: 'Firefox temporary add-ons are removed when the browser restarts. For permanent installation, the extension would need to be signed via the Firefox Add-ons portal.',
  },
  safari: {
    label: 'Safari',
    steps: [
      'Safari requires a native macOS app wrapper — the extension cannot be loaded from a ZIP.',
      'Clone or download the StarServer repository from GitHub.',
      'Open a Terminal, cd into the extension/ folder, and run: chmod +x build-safari.sh && ./build-safari.sh',
      'Open the generated Xcode project in Xcode (macOS + Xcode 14+ required).',
      'Set your signing Team, then Build & Run (⌘R).',
      'Enable the extension in Safari → Settings → Extensions.',
    ],
    note: 'Xcode and macOS are required to build the Safari extension wrapper.',
  },
  other: {
    label: 'your browser',
    steps: [
      'Click "Download Extension" to save the ZIP file.',
      "Unzip the downloaded file — you'll get a folder called starserver-extension.",
      "Open your browser's extensions page and enable Developer mode.",
      'Use "Load unpacked" (or equivalent) and select the unzipped folder.',
    ],
  },
};

function BrowserIcon({ browser }: { browser: Browser }) {
  if (browser === 'safari') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    );
  }
  if (browser === 'firefox') {
    return <Globe className="h-5 w-5" aria-hidden="true" />;
  }
  if (browser === 'chrome' || browser === 'edge') {
    return <Chrome className="h-5 w-5" aria-hidden="true" />;
  }
  return <Globe className="h-5 w-5" aria-hidden="true" />;
}

export function InstallExtensionCard() {
  const [browser, setBrowser] = React.useState<Browser>('other');
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    setBrowser(detectBrowser());
  }, []);

  const info = STEPS[browser];
  const isSafari = browser === 'safari';

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Card header */}
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">Browser Extension</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Open any movie or TV show directly from your browser by copying its
          title.
        </p>
      </div>

      {/* Body */}
      <div className="space-y-4 px-5 py-4">
        {/* Feature pills */}
        <div className="flex flex-wrap gap-2">
          {[
            'Clipboard auto-detect',
            'Right-click → Open in StarServer',
            'Instant search popup',
          ].map((f) => (
            <span
              key={f}
              className="bg-primary/10 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-primary">
              <Check className="h-3 w-3" aria-hidden="true" />
              {f}
            </span>
          ))}
        </div>

        {/* Detected browser row */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <BrowserIcon browser={browser} />
            Detected browser:&nbsp;
            <span className="font-medium text-foreground">{info.label}</span>
          </span>
          {!isSafari && (
            <a
              href="/starserver-extension.zip"
              download="starserver-extension.zip"
              aria-label="Download StarServer browser extension ZIP">
              <Button size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Download Extension
              </Button>
            </a>
          )}
        </div>

        {/* Safari special CTA */}
        {isSafari && (
          <div className="bg-muted/40 rounded-md border border-border px-4 py-3 text-sm">
            <p className="font-medium">Safari requires an Xcode build step.</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Clone the repository and run{' '}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                extension/build-safari.sh
              </code>{' '}
              to generate the Xcode project.
            </p>
          </div>
        )}

        {/* Expandable install steps */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between rounded text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
          {expanded ? 'Hide' : 'Show'} installation steps for {info.label}
          <ExternalLink
            className={cn(
              'h-3.5 w-3.5 transition-transform',
              expanded && 'rotate-45',
            )}
            aria-hidden="true"
          />
        </button>

        {expanded && (
          <ol className="space-y-2 text-sm">
            {info.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="bg-primary/10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
            {info.note && (
              <li className="flex gap-3 pt-1">
                <span className="text-muted-foreground/50 shrink-0">ℹ</span>
                <span className="text-muted-foreground/70 text-xs italic">
                  {info.note}
                </span>
              </li>
            )}
          </ol>
        )}
      </div>
    </div>
  );
}
