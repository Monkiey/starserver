'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { useSearchStore } from '@/stores/search';
import {
  cn,
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
import { ChevronDown } from 'lucide-react';

const AI_SEARCH_ENDPOINT = '/api/ai/search';

type SearchDialogMode = 'title' | 'genre';

/**
 * Cross-platform genres supported by both the TMDB movie and TV discover
 * endpoints. TV-only genres (Soap, Talk, News, Kids, Reality, etc.) are
 * intentionally excluded because they do not work with the movie endpoint.
 */
const GENRE_OPTIONS = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
] as const;

interface SearchResult {
  results: Show[];
}

export function SearchDialog() {
  const searchStore = useSearchStore();
  const modalStore = useModalStore();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const [mode, setMode] = React.useState<SearchDialogMode>('title');
  const [selectedGenreId, setSelectedGenreId] = React.useState<number | null>(
    null,
  );

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

  // auto-focus input when dialog opens (title mode only)
  React.useEffect(() => {
    if (searchStore.isOpen && mode === 'title' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchStore.isOpen, mode]);

  /** Switch between title and genre modes, clearing previous results. */
  const handleModeChange = (newMode: SearchDialogMode) => {
    setMode(newMode);
    setSelectedGenreId(null);
    searchStore.setShows([]);
    searchStore.setQuery('');
  };

  // ── Title search ────────────────────────────────────────────────────────
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
          body: JSON.stringify({ query: normalizedValue, mode: 'title' }),
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

  // ── Genre search ────────────────────────────────────────────────────────
  const handleGenreSelect = React.useCallback(
    async (genreId: number) => {
      setSelectedGenreId(genreId);
      searchStore.setLoading(true);
      searchStore.setShows([]);

      try {
        const response = await fetch(AI_SEARCH_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'genre', genreId }),
        });

        if (!response.ok) throw new Error('Genre search failed');

        const data = (await response.json()) as SearchResult;
        searchStore.setShows(data.results);
      } catch (error) {
        console.error('Genre search error:', error);
        searchStore.setShows([]);
      } finally {
        searchStore.setLoading(false);
      }
    },
    [searchStore],
  );

  // ── Shared ───────────────────────────────────────────────────────────────
  const handleClose = () => {
    searchStore.setOpen(false);
    searchStore.reset();
    setMode('title');
    setSelectedGenreId(null);
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
          className="border-border/40 bg-background/95 top-[5%] max-h-[85vh] w-full max-w-2xl translate-y-0 overflow-hidden rounded-xl border p-0 shadow-2xl backdrop-blur-xl data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]"
          aria-describedby="search-dialog-description">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription id="search-dialog-description" className="sr-only">
            Search for movies and TV shows
          </DialogDescription>

          {/* ── Header bar ── */}
          <div className="flex items-center gap-2 border-b px-4">
            <Icons.search className="h-5 w-5 shrink-0 text-muted-foreground" />

            {mode === 'title' ? (
              <Input
                key="title-input"
                ref={inputRef}
                placeholder="Search movies, TV shows, actors..."
                className="h-12 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                defaultValue={searchStore.query}
                onChange={handleChange}
                maxLength={80}
              />
            ) : (
              <span
                className="flex-1 py-3 text-base text-muted-foreground"
                aria-label="Genre browse mode active">
                Browse by genre
              </span>
            )}

            {/* Mode dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'h-8 shrink-0 gap-1 rounded-full text-xs font-medium',
                )}>
                {mode === 'title' ? 'Title' : 'Genre'}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onSelect={() => handleModeChange('title')}
                  className={cn(
                    mode === 'title' && 'bg-accent text-accent-foreground',
                  )}>
                  Title search
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleModeChange('genre')}
                  className={cn(
                    mode === 'genre' && 'bg-accent text-accent-foreground',
                  )}>
                  Genre browse
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <kbd className="pointer-events-none hidden select-none rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
              ESC
            </kbd>
          </div>

          {/* ── Body ── */}
          <div className="max-h-[calc(85vh-3.5rem)] overflow-y-auto px-2 pb-2">
            {mode === 'genre' ? (
              /* Genre browse mode */
              <div className="p-3">
                <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Select a genre
                </p>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => void handleGenreSelect(genre.id)}
                      aria-pressed={selectedGenreId === genre.id}
                      className={cn(
                        'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                        selectedGenreId === genre.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'hover:border-primary/50 border-border bg-background text-foreground hover:bg-accent',
                      )}>
                      {genre.name}
                    </button>
                  ))}
                </div>

                {/* Results below chips */}
                {searchStore.loading ? (
                  <div className="mt-4">
                    <SearchSkeleton />
                  </div>
                ) : searchStore.shows?.length ? (
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {searchStore.shows.map((show: Show) => (
                      <SearchResultCard
                        key={show.id}
                        show={show}
                        onClick={() => handleShowClick(show)}
                      />
                    ))}
                  </div>
                ) : selectedGenreId !== null ? (
                  <div className="mt-8 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No results found for this genre
                    </p>
                  </div>
                ) : null}
              </div>
            ) : /* Title search mode */
            searchStore.loading ? (
              <SearchSkeleton />
            ) : searchStore.query && !searchStore.shows?.length ? (
              <div className="py-12 text-center">
                <Icons.search className="text-muted-foreground/50 mx-auto mb-4 h-10 w-10" />
                <p className="text-sm text-muted-foreground">
                  No results found for &quot;{searchStore.query}&quot;
                </p>
                <p className="text-muted-foreground/70 mt-1 text-xs">
                  Try different keywords, a movie title, or switch to Genre
                  browse
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
                <Icons.sparkles className="text-muted-foreground/50 mx-auto mb-4 h-10 w-10" />
                <p className="text-sm text-muted-foreground">
                  Search for movies and TV shows
                </p>
                <p className="text-muted-foreground/70 mt-1 text-xs">
                  Type a title above, or switch to Genre browse
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
      className="hover:ring-primary/50 group relative flex flex-col overflow-hidden rounded-lg text-left transition-all hover:ring-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
          <span className="bg-primary/10 rounded px-1 py-0.5 text-[10px] font-medium text-primary">
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
