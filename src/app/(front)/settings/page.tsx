'use client';

import React from 'react';
import PageHeader from '@/components/page-header';
import { useNotificationSettingsStore } from '@/stores/notification-settings';
import { cn } from '@/lib/utils';

const Toggle = ({
  enabled,
  onToggle,
  id,
}: {
  enabled: boolean;
  onToggle: () => void;
  id: string;
}) => (
  <button
    id={id}
    role="switch"
    aria-checked={enabled}
    onClick={onToggle}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      enabled ? 'bg-primary' : 'bg-input',
    )}>
    <span
      className={cn(
        'pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
        enabled ? 'translate-x-5' : 'translate-x-0',
      )}
    />
  </button>
);

export default function SettingsPage() {
  const {
    notifyNewEpisodes,
    notifyNewReleases,
    setNotifyNewEpisodes,
    setNotifyNewReleases,
  } = useNotificationSettingsStore();

  const [permission, setPermission] = React.useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  );

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const handleToggleEpisodes = () => {
    const next = !notifyNewEpisodes;
    if (next && permission !== 'granted') {
      void requestPermission().then(() => {
        if (Notification.permission === 'granted') {
          setNotifyNewEpisodes(true);
        }
      });
    } else {
      setNotifyNewEpisodes(next);
    }
  };

  const handleToggleReleases = () => {
    const next = !notifyNewReleases;
    if (next && permission !== 'granted') {
      void requestPermission().then(() => {
        if (Notification.permission === 'granted') {
          setNotifyNewReleases(true);
        }
      });
    } else {
      setNotifyNewReleases(next);
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Customize your viewing experience."
      />
      <div className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Notifications card */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Notifications</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Get notified about updates to your favorite titles.
              </p>
            </div>
            <div className="divide-y divide-border">
              {permission === 'denied' && (
                <div className="px-5 py-3 text-xs text-destructive">
                  Browser notifications are blocked. Please enable them in your
                  browser settings.
                </div>
              )}
              <div className="flex items-center justify-between px-5 py-3">
                <label
                  htmlFor="notify-episodes"
                  className="cursor-pointer space-y-0.5">
                  <span className="text-sm">New episodes</span>
                  <p className="text-xs text-muted-foreground">
                    Notify when a favorite TV show has a new episode.
                  </p>
                </label>
                <Toggle
                  id="notify-episodes"
                  enabled={notifyNewEpisodes}
                  onToggle={handleToggleEpisodes}
                />
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <label
                  htmlFor="notify-releases"
                  className="cursor-pointer space-y-0.5">
                  <span className="text-sm">New movie releases</span>
                  <p className="text-xs text-muted-foreground">
                    Notify when a favorite movie becomes available.
                  </p>
                </label>
                <Toggle
                  id="notify-releases"
                  enabled={notifyNewReleases}
                  onToggle={handleToggleReleases}
                />
              </div>
            </div>
          </div>

          {/* About card */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">About</h2>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm font-medium">3.0</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-muted-foreground">
                  Data source
                </span>
                <span className="text-sm font-medium">TMDB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
