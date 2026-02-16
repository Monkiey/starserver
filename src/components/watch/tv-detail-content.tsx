'use client';

import React from 'react';
import Link from 'next/link';
import ShowWatchPicker from '@/components/show-watch-picker';
import { Button } from '@/components/ui/button';
import { getYear } from '@/lib/utils';
import { useContinueWatchingStore } from '@/stores/continue-watching';
import { MediaType, type ISeason, type ShowWithGenreAndVideo } from '@/types';

interface TvDetailContentProps {
  show: ShowWithGenreAndVideo;
  seasons: ISeason[];
}

const TvDetailContent = ({ show, seasons }: TvDetailContentProps) => {
  const continueWatchingStore = useContinueWatchingStore();

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-foreground/80">
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-base font-semibold text-foreground sm:text-lg">
              {show.name ?? show.title}
            </h1>
            <Link href="/" prefetch={false}>
              <Button variant="outline" className="rounded-full text-xs">
                Back to browse
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {show.first_air_date && <span>{getYear(show.first_air_date)}</span>}
            {show.number_of_seasons && (
              <span>• {show.number_of_seasons} seasons</span>
            )}
            {show.original_language && (
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs font-medium uppercase">
                {show.original_language}
              </span>
            )}
          </div>
          {show.overview && (
            <p className="max-w-3xl text-xs text-foreground/80 sm:text-sm">
              {show.overview}
            </p>
          )}
        </div>
      </div>
      <ShowWatchPicker
        show={{ ...show, media_type: MediaType.TV }}
        seasons={seasons}
        onPlay={(tvShow) => continueWatchingStore.addItem(tvShow)}
      />
    </main>
  );
};

export default TvDetailContent;
