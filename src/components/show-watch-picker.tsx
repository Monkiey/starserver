'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { getNameFromShow, getYear } from '@/lib/utils';
import { MediaType, type IEpisode, type ISeason, type Show } from '@/types';

interface ShowWatchPickerProps {
  show: Show;
  seasons: ISeason[];
  onPlay?: (show: Show) => void;
}

const ShowWatchPicker = ({ show, seasons, onPlay }: ShowWatchPickerProps) => {
  const isTv = show.media_type === MediaType.TV;
  const [activeSeason, setActiveSeason] = React.useState<ISeason | null>(
    seasons[0] ?? null,
  );

  if (!isTv) {
    const releaseDate = show.release_date ?? show.first_air_date;
    return (
      <div className="mt-6 grid gap-4 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-foreground/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-base font-semibold">Play Movie</p>
            <p className="text-xs text-muted-foreground">
              {releaseDate ? getYear(releaseDate) : 'Release date'}
              {show.runtime ? ` • ${show.runtime} min` : ''}
            </p>
          </div>
          <Link href={`/watch/movie/${show.id}`} prefetch={false}>
            <Button
              className="h-auto gap-2 rounded-full px-4 py-2"
              onClick={() => onPlay?.(show)}>
              <Icons.play className="h-4 w-4 fill-current" aria-hidden="true" />
              Watch
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Jump back in instantly or start from the beginning with a clean,
          cinema-style player.
        </p>
      </div>
    );
  }

  if (!seasons.length || !activeSeason) {
    return null;
  }

  return (
    <div className="mt-6 grid gap-4 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-foreground/80">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-base font-semibold">Seasons & Episodes</p>
          <p className="text-xs text-muted-foreground">
            Choose a season, then jump into any episode.
          </p>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {seasons.map((season) => (
            <button
              key={season.id}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                activeSeason?.id === season.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/60 text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveSeason(season)}>
              {`Season ${season.season_number}`}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        {activeSeason.episodes?.map((episode: IEpisode) => (
          <Link
            key={episode.id}
            href={`/watch/tv/${show.id}/player?season=${episode.season_number}&episode=${episode.episode_number}`}
            prefetch={false}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2 transition hover:border-primary/40"
            onClick={() => onPlay?.(show)}>
            <div>
              <p className="text-sm font-medium text-foreground">
                {`Episode ${episode.episode_number}: ${episode.name}`}
              </p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {episode.overview || `Continue ${getNameFromShow(show)}`}
              </p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20">
              <Icons.play className="h-4 w-4 fill-current" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ShowWatchPicker;
