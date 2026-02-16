'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { useSearchStore } from '@/stores/search';
import {
  debounce,
  getNameFromShow,
  getSlug,
  isShowDetailPage,
} from '@/lib/utils';
import { MediaType, type Show } from '@/types';
import CustomImage from '@/components/custom-image';
import { useModalStore } from '@/stores/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname } from 'next/navigation';

const AI_SEARCH_ENDPOINT = '/api/ai/search';

interface SearchResult {
  results: Show[];
}

export function SearchDialog() {
  const searchStore = useSearchStore();
  const modalStore = useModalStore();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Disable search on movie/TV show detail pages to avoid modal conflicts
  const isDetailPage = isShowDetailPage(pathname);

  // keyboard shortcut to open
  React.useEffect(() => {
    if (isDetailPage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchStore.setOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchStore, isDetailPage]);

  // auto-focus input when dialog opens
  React.useEffect(() => {
    if (searchStore.isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchStore.isOpen]);

  const performSearch = React.useCallback(
    async (query: string) => {
      const normalizedValue = query?.trim() ?? '';
      if (!normalizedValue.length) {
        searchStore.setShows([]);
        searchStore.setQuery('');
        searchStore.setLoading(false);
        return;
      }

      searchStore.setQuery(normalizedValue);
      searchStore.setLoading(true);

      try {
        const response = await fetch(AI_SEARCH_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: normalizedValue }),
        });

        if (!response.ok) throw new Error('Search failed');

        const data = (await response.json()) as SearchResult;
        searchStore.setShows(data.results);
      } catch (error) {
        console.error('Search error:', error);
        searchStore.setShows([]);
      } finally {
        searchStore.setLoading(false);
      }
    },
    [searchStore],
  );

  const performSearchRef = React.useRef(performSearch);
  performSearchRef.current = performSearch;

  const debouncedSearch = React.useMemo(
    () =>
      debounce((value) => {
        void performSearchRef.current(value as string);
      }, 300),
    [],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const handleClose = () => {
    searchStore.setOpen(false);
    searchStore.reset();
  };

  const handleShowClick = (show: Show) => {
    const name = getNameFromShow(show);
    const path: string =
      show.media_type === MediaType.TV ? 'tv-shows' : 'movies';
    window.history.pushState(null, '', `/${path}/${getSlug(show.id, name)}`);
    modalStore.setShow(show);
    modalStore.setOpen(true);
    modalStore.setPlay(true);
    searchStore.setOpen(false);
  };

  if (isDetailPage) return null;

  return (
    <>
      <Dialog open={searchStore.isOpen} onOpenChange={handleClose}>
        <DialogContent
          className="top-[5%] max-h-[85vh] w-full max-w-2xl translate-y-0 overflow-hidden rounded-xl border border-border/40 bg-background/95 p-0 shadow-2xl backdrop-blur-xl data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]"
          aria-describedby="search-dialog-description">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription id="search-dialog-description" className="sr-only">
            Search for movies and TV shows
          </DialogDescription>
          <div className="flex items-center border-b px-4">
            <Icons.search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search movies, TV shows, actors..."
              className="h-12 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              defaultValue={searchStore.query}
              onChange={handleChange}
              maxLength={80}
            />
            <kbd className="pointer-events-none ml-2 hidden select-none rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
              ESC
            </kbd>
          </div>
          <div className="max-h-[calc(85vh-3.5rem)] overflow-y-auto px-2 pb-2">
            {searchStore.loading ? (
              <SearchSkeleton />
            ) : searchStore.query && !searchStore.shows?.length ? (
              <div className="py-12 text-center">
                <Icons.search className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No results found for &quot;{searchStore.query}&quot;
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Try different keywords, a movie title, or genre
                </p>
              </div>
            ) : searchStore.shows?.length ? (
              <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4 md:grid-cols-5">
                {searchStore.shows.map((show: Show) => (
                  <SearchResultCard
                    key={show.id}
                    show={show}
                    onClick={() => handleShowClick(show)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Icons.sparkles className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Search for movies and TV shows
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Try &quot;action movies&quot; or &quot;feel good
                  comedies&quot;
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchResultCard({
  show,
  onClick,
}: {
  show: Show;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-lg text-left transition-all hover:ring-2 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <CustomImage
          src={
            show.poster_path ?? show.backdrop_path
              ? `https://image.tmdb.org/t/p/w300${
                  show.poster_path ?? show.backdrop_path
                }`
              : '/images/grey-thumbnail.jpg'
          }
          alt={getNameFromShow(show) || 'poster'}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex flex-col gap-0.5 p-1.5">
        <p className="line-clamp-1 text-xs font-medium">
          {getNameFromShow(show)}
        </p>
        <div className="flex items-center gap-1">
          <span className="rounded bg-primary/10 px-1 py-0.5 text-[10px] font-medium text-primary">
            {show.media_type === MediaType.TV ? 'TV' : 'Movie'}
          </span>
          {(show.release_date ?? show.first_air_date) &&
            !isNaN(
              new Date(
                show.release_date ?? show.first_air_date ?? '',
              ).getTime(),
            ) && (
              <span className="text-[10px] text-muted-foreground">
                {new Date(
                  show.release_date ?? show.first_air_date ?? '',
                ).getFullYear()}
              </span>
            )}
        </div>
      </div>
    </button>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4 md:grid-cols-5">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <Skeleton className="h-3 w-3/4 rounded" />
          <Skeleton className="h-2.5 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

export default SearchDialog;
