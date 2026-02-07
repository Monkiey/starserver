'use client';

import React from 'react';
import { type Show } from '@/types';
import ShowsGrid from '@/components/shows-grid';
import { useSearchStore } from '@/stores/search';
import {
  cn,
  handleDefaultSearchBtn,
  handleDefaultSearchInp,
} from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { DebouncedInput } from '@/components/debounced-input';
import MovieService from '@/services/MovieService';

interface SearchContainer {
  query: string;
  shows: Show[];
}

function SearchContainer({ shows, query }: SearchContainer) {
  const searchStore = useSearchStore();
  const router = useRouter();

  React.useEffect(() => {
    searchStore.setOpen(true);
    searchStore.setQuery(query);
    searchStore.setShows(shows);
    const timer1: NodeJS.Timeout = setTimeout(() => {
      handleDefaultSearchBtn();
    }, 5);
    const timer2: NodeJS.Timeout = setTimeout(() => {
      handleDefaultSearchInp();
    }, 10);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [query, searchStore, shows]);

  const handleBack = () => {
    searchStore.reset();
    searchStore.setOpen(false);
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/');
  };

  const handleSearch = async (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue.length) {
      searchStore.reset();
      searchStore.setOpen(false);
      router.push('/');
      return;
    }

    if (trimmedValue === searchStore.query.trim()) {
      return;
    }

    searchStore.setOpen(true);
    searchStore.setQuery(trimmedValue);
    searchStore.setLoading(true);

    try {
      const response = await MovieService.searchMovies(trimmedValue);
      searchStore.setShows(response.results);
      router.push(`/search?q=${encodeURIComponent(trimmedValue)}`);
    } catch (error) {
      // keep minimal surface area for now; a future toast could surface the error
      console.error('Failed to search titles', error);
    } finally {
      searchStore.setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl space-y-10 pb-6 pt-4">
      <div className="border-white/15 relative overflow-hidden rounded-3xl border bg-black/60 p-4 text-white shadow-[0_24px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6">
        <div
          className="bg-white/8 pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-black/50"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              Search
            </p>
            <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
              Find your next favorite title
            </h1>
            <p className="text-sm text-white/70">
              Browse movies and TV shows without leaving the flow of the app.
            </p>
          </div>
          <Button
            variant="ghost"
            className="bg-white/15 w-full justify-start gap-2 rounded-full border border-white/25 text-white shadow-sm backdrop-blur sm:w-auto"
            onClick={handleBack}>
            <Icons.chevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
        </div>
        <div
          className={cn(
            'relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
            'overflow-hidden rounded-2xl border border-white/20 bg-black/60 p-3 shadow-inner backdrop-blur-xl',
          )}>
          <div
            className="bg-white/6 pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-black/50"
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Explore
              </p>
              <p className="text-sm text-white/70">
                Search across movies and TV shows.
              </p>
            </div>
            <div className="w-full sm:max-w-md">
              <DebouncedInput
                id="search-page-input"
                variant="fluid"
                open
                value={searchStore.query}
                onChange={handleSearch}
                onChangeStatusOpen={searchStore.setOpen}
                containerClassName="w-full"
              />
            </div>
          </div>
        </div>
      </div>
      <ShowsGrid shows={searchStore.shows} query={searchStore.query} />
    </div>
  );
}

export default SearchContainer;
