'use client';

import PageHeader from '@/components/page-header';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const themes = [
  {
    id: 'dark',
    name: 'Metal Dark',
    description: 'Liquid metal 3D with silver-blue accents',
    preview: {
      bg: 'bg-[#161b2a]',
      sidebar: 'bg-[#111622]',
      accent: 'bg-[#dce4f0]',
      card: 'bg-[#1c2336]',
    },
  },
  {
    id: 'movieasap',
    name: 'MovieASAP',
    description: 'Deep black cinema look with crimson red accents',
    preview: {
      bg: 'bg-[#0d0d0d]',
      sidebar: 'bg-[#111111]',
      accent: 'bg-[#d93025]',
      card: 'bg-[#1a1a1a]',
    },
  },
] as const;

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
          {/* Template / Theme card */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Template</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choose a visual style for the site.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'relative flex flex-col gap-2 rounded-lg border-2 p-3 text-left transition-all hover:border-primary/60',
                    theme === t.id
                      ? 'border-primary ring-1 ring-primary/30'
                      : 'border-border',
                  )}
                  aria-pressed={theme === t.id}
                  aria-label={`Select ${t.name} template`}>
                  {/* Mini preview swatch */}
                  <div
                    className={cn(
                      'relative h-16 w-full overflow-hidden rounded-md',
                      t.preview.bg,
                    )}>
                    {/* Sidebar strip */}
                    <div
                      className={cn(
                        'absolute bottom-0 left-0 top-0 w-[28%]',
                        t.preview.sidebar,
                      )}
                    />
                    {/* Content area – mock cards */}
                    <div className="absolute left-[32%] right-2 top-2 space-y-1.5">
                      <div
                        className={cn(
                          'h-2 w-3/4 rounded-sm opacity-60',
                          t.preview.card,
                        )}
                      />
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              'h-7 flex-1 rounded-sm',
                              t.preview.card,
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Accent dot */}
                    <div
                      className={cn(
                        'absolute left-2 top-2 h-2 w-2 rounded-full',
                        t.preview.accent,
                      )}
                    />
                    {/* Active indicator */}
                    {theme === t.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-6 w-6 text-primary drop-shadow">
                          <path
                            fillRule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight">
                      {t.name}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                </button>
              ))}
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
                <span className="text-sm font-medium">4.0</span>
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
