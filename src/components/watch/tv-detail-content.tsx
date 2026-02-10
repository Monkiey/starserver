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
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {show.name ?? show.title}
        </h1>
        <Link href="/" prefetch={false}>
          <Button variant="outline" className="rounded-full">
            Back to browse
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {show.first_air_date && <span>{getYear(show.first_air_date)}</span>}
        {show.number_of_seasons && (
          <span>• {show.number_of_seasons} seasons</span>
        )}
        {show.original_language && (
          <span className="uppercase">• {show.original_language}</span>
        )}
      </div>
      {show.overview && (
        <p className="max-w-3xl text-sm text-foreground/80 sm:text-base">
          {show.overview}
        </p>
      )}
      <ShowWatchPicker
        show={{ ...show, media_type: MediaType.TV }}
        seasons={seasons}
        onPlay={(tvShow) => continueWatchingStore.addItem(tvShow)}
      />
    </main>
  );
};

export default TvDetailContent;
