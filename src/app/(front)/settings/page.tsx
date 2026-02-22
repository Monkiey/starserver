'use client';

import React from 'react';
import PageHeader from '@/components/page-header';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Customize your viewing experience."
      />
      <div className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Appearance card */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Appearance</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choose how the interface looks for you.
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Theme
              </p>
              <div className="flex gap-2">
                {themes.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-2 rounded-lg border px-3 py-4 text-xs font-medium transition-colors',
                      theme === value
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}>
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
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
                <span className="text-sm font-medium">2.1</span>
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
