'use client';

import React from 'react';
import {
  CAPTION_LANGUAGE_OPTIONS,
  useUserSettingsStore,
} from '@/stores/user-settings';

const videoSourceOptions = [
  { label: 'VidSrc (default)', value: 'vidsrc' },
  { label: 'Vidplay', value: 'vidplay' },
  { label: 'UpCloud', value: 'upcloud' },
];

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export default function SettingsPage() {
  const {
    defaultVideoSource,
    defaultCaptionsLanguage,
    setDefaultVideoSource,
    setDefaultCaptionsLanguage,
  } = useUserSettingsStore();

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your viewing experience.
          </p>
        </div>

        <div className="space-y-6 rounded-lg border bg-card p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Playback defaults</h2>
            <p className="text-sm text-muted-foreground">
              Choose how videos should load by default.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="video-source"
                className="text-sm font-medium text-foreground">
                Default video source
              </label>
              <p className="text-sm text-muted-foreground">
                Pick the streaming source we should try first when starting a
                video.
              </p>
              <select
                id="video-source"
                value={defaultVideoSource}
                onChange={(event) => setDefaultVideoSource(event.target.value)}
                className={selectClassName}>
                {videoSourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="captions-language"
                className="text-sm font-medium text-foreground">
                Default captions language
              </label>
              <p className="text-sm text-muted-foreground">
                We&apos;ll request captions in this language when available.
              </p>
              <select
                id="captions-language"
                value={defaultCaptionsLanguage}
                onChange={(event) =>
                  setDefaultCaptionsLanguage(event.target.value)
                }
                className={selectClassName}>
                {CAPTION_LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
