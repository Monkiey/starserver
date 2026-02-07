'use client';

import React from 'react';
import Link from 'next/link';
import { type ISeason } from '@/types';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

interface SeasonPickerProps {
  seasons: ISeason[];
  showId: number;
}

export default function SeasonPicker(props: SeasonPickerProps) {
  const sortedSeasons = React.useMemo(
    () => [...props.seasons].sort((a, b) => b.season_number - a.season_number),
    [props.seasons],
  );

  const [activeSeasonId, setActiveSeasonId] = React.useState<number | null>(
    sortedSeasons[0]?.id ?? null,
  );

  React.useEffect(() => {
    if (!sortedSeasons.length) {
      setActiveSeasonId(null);
      return;
    }

    setActiveSeasonId((currentId) => {
      const exists = sortedSeasons.some((season) => season.id === currentId);
      return exists ? currentId : sortedSeasons[0].id;
    });
  }, [sortedSeasons]);

  const activeSeason =
    sortedSeasons.find((season) => season.id === activeSeasonId) ??
    sortedSeasons[0];

  const episodes = React.useMemo(
    () =>
      [...(activeSeason?.episodes ?? [])].sort(
        (a, b) => a.episode_number - b.episode_number,
      ),
    [activeSeason?.episodes],
  );

  return (
    <div className="border-white/15 relative space-y-4 overflow-hidden rounded-3xl border bg-black/60 p-4 text-white shadow-[0_18px_80px_-60px_rgba(0,0,0,0.9)] backdrop-blur">
      <div
        className="bg-white/8 pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-black/50"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">Seasons & Episodes</p>
          <p className="text-xs text-white/70">
            Pick a season to browse available episodes.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="bg-white/15 min-w-[160px] justify-between border border-white/25 text-sm font-semibold text-white shadow-sm backdrop-blur">
              <span className="truncate">
                {`Season ${activeSeason?.season_number}: ${activeSeason?.name}`}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-down h-4 w-4 flex-shrink-0">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="max-h-72 w-64 overflow-auto">
            {sortedSeasons.map((season) => (
              <DropdownMenuItem
                key={season.id}
                onClick={() => setActiveSeasonId(season.id)}
                className="cursor-pointer truncate text-sm">
                {`Season ${season.season_number}: ${season.name}`}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative z-10 grid gap-3 md:grid-cols-2">
        {episodes.map((episode) => (
          <div
            key={episode.id}
            className="border-white/15 group relative overflow-hidden rounded-2xl border bg-black/60 p-3 text-white shadow-sm transition hover:-translate-y-0.5 hover:border-white/25 hover:shadow-md">
            <div
              className="bg-white/6 pointer-events-none absolute inset-0"
              aria-hidden="true"
            />
            <div
              className="bg-black/45 pointer-events-none absolute inset-0"
              aria-hidden="true"
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-white/12 text-xs font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur">
                    {`S${episode.season_number} · E${episode.episode_number}`}
                  </Badge>
                  <span className="text-xs text-white/70">
                    {episode.runtime ? `${episode.runtime}m` : '—'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {episode.name || 'Untitled episode'}
                </p>
                <p className="line-clamp-2 text-xs text-white/70">
                  {episode.overview ||
                    'No synopsis available for this episode.'}
                </p>
              </div>
              <Link
                prefetch={false}
                href={`/watch/tv/${props.showId}?season=${episode.season_number}&episode=${episode.episode_number}`}>
                <Button size="sm" className="whitespace-nowrap">
                  Watch
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
