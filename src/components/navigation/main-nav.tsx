'use client';

import React from 'react';
import { type Show, type NavItem } from '@/types';
import Link from 'next/link';
import {
  cn,
  getSearchValue,
  handleDefaultSearchBtn,
  handleDefaultSearchInp,
} from '@/lib/utils';
import { siteConfig } from '@/configs/site';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search';
import { ModeToggle as ThemeToggle } from '@/components/theme-toggle';
import { DebouncedInput } from '@/components/debounced-input';
import MovieService from '@/services/MovieService';
import { StarSearchToggle } from '@/components/star-search-toggle';
import { useStarSettingsStore } from '@/stores/star-settings';

// API endpoint for AI-powered search
const AI_SEARCH_ENDPOINT = '/api/ai/search';

interface MainNavProps {
  items?: NavItem[];
}

interface SearchResult {
  results: Show[];
}

export function MainNav({ items }: MainNavProps) {
  const path = usePathname();
  const router = useRouter();
  // search store
  const searchStore = useSearchStore();
  const { enableStarSearch, toggleStarSearch } = useStarSettingsStore();
  const [isScrolled, setIsScrolled] = React.useState(false);

  const handlePopstateEvent = React.useCallback(() => {
    const pathname = window.location.pathname;
    const search: string = getSearchValue('q');

    if (!search?.length || !pathname.includes('/search')) {
      searchStore.reset();
      searchStore.setOpen(false);
    } else if (search?.length) {
      searchStore.setOpen(true);
      searchStore.setLoading(true);
      searchStore.setQuery(search);
      setTimeout(() => {
        handleDefaultSearchBtn();
      }, 10);
      setTimeout(() => {
        handleDefaultSearchInp();
      }, 20);

      // Use AI-powered search only if Star Search is enabled
      // Read the current state directly from the store to avoid stale closure
      const isStarSearchEnabled =
        useStarSettingsStore.getState().enableStarSearch;
      if (isStarSearchEnabled) {
        fetch(AI_SEARCH_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: search }),
        })
          .then(async (response) => {
            if (!response.ok) throw new Error('Search failed');
            const data = (await response.json()) as SearchResult;
            void searchStore.setShows(data.results);
          })
          .catch((e) => {
            console.error('Search error:', e);
            void searchStore.setShows([]);
          })
          .finally(() => searchStore.setLoading(false));
      } else {
        // Use regular search
        MovieService.searchMovies(search)
          .then((response) => {
            void searchStore.setShows(response.results);
          })
          .catch((e) => {
            console.error('Search error:', e);
            void searchStore.setShows([]);
          })
          .finally(() => searchStore.setLoading(false));
      }
    }
  }, [searchStore]);

  React.useEffect(() => {
    window.addEventListener('popstate', handlePopstateEvent, false);
    return () => {
      window.removeEventListener('popstate', handlePopstateEvent, false);
    };
  }, [handlePopstateEvent]);

  async function searchShowsByQuery(value: string) {
    const normalizedValue = value?.trim() ?? '';
    if (!normalizedValue.length) {
      if (path === '/search') {
        router.push('/');
      } else {
        window.history.pushState(null, '', path);
      }
      return;
    }

    if (getSearchValue('q')?.trim()?.length) {
      window.history.replaceState(null, '', `/search?q=${normalizedValue}`);
    } else {
      window.history.pushState(null, '', `/search?q=${normalizedValue}`);
    }

    if (normalizedValue === searchStore.query) {
      return;
    }

    searchStore.setQuery(normalizedValue);
    searchStore.setLoading(true);

    try {
      // Read the current state directly from the store
      const isStarSearchEnabled =
        useStarSettingsStore.getState().enableStarSearch;
      if (isStarSearchEnabled) {
        // Use AI-powered search when Star Search is enabled
        const response = await fetch(AI_SEARCH_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: normalizedValue }),
        });

        if (!response.ok) {
          throw new Error('AI search failed');
        }

        const data = (await response.json()) as {
          results: Show[];
        };

        searchStore.setLoading(false);
        void searchStore.setShows(data.results);
      } else {
        // Use regular search when Star Search is disabled
        const response = await MovieService.searchMovies(normalizedValue);
        searchStore.setLoading(false);
        void searchStore.setShows(response.results);
      }
    } catch (error) {
      console.error('Search error:', error);
      searchStore.setLoading(false);
      void searchStore.setShows([]);
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // change background color on scroll
  React.useEffect(() => {
    const changeBgColor = () => {
      window.scrollY > 0 ? setIsScrolled(true) : setIsScrolled(false);
    };
    window.addEventListener('scroll', changeBgColor);
    return () => window.removeEventListener('scroll', changeBgColor);
  }, [isScrolled]);

  const handleChangeStatusOpen = (value: boolean): void => {
    searchStore.setOpen(value);
    if (!value) searchStore.reset();
  };

  return (
    <nav
      className={cn(
        'relative z-50 w-full transition-colors duration-300 md:sticky',
        isScrolled ? 'bg-background/80 backdrop-blur' : 'bg-transparent',
      )}>
      <div className="mx-auto flex w-full items-center justify-between px-[4vw] py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 rounded-full border border-border/60 bg-background/80 px-4 py-2 shadow-sm backdrop-blur">
            <Link
              href="/"
              className="hidden items-center space-x-2 md:flex"
              onClick={() => handleChangeStatusOpen(false)}>
              <Icons.logo className="h-6 w-6" aria-hidden="true" />
              <span className="inline-block font-heading text-lg font-semibold uppercase tracking-wide">
                {siteConfig.name}
              </span>
              <span className="sr-only">Home</span>
            </Link>
            {items?.length ? (
              <nav className="hidden items-center gap-5 md:flex">
                {items?.map(
                  (item, index) =>
                    item.href && (
                      <Link
                        key={index}
                        href={item.href}
                        className={cn(
                          'flex items-center text-sm font-medium text-foreground/60 transition hover:text-foreground/90',
                          path === item.href && 'font-semibold text-foreground',
                          item.disabled && 'cursor-not-allowed opacity-80',
                        )}
                        onClick={() => handleChangeStatusOpen(false)}>
                        {item.title}
                      </Link>
                    ),
                )}
              </nav>
            ) : null}
            <div className="block md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 px-0 hover:bg-transparent focus:ring-0">
                    <Icons.logo className="h-6 w-6" />
                    <span className="font-heading text-base font-semibold uppercase tracking-wide">
                      Menu
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={20}
                  className="w-52 overflow-y-auto overflow-x-hidden rounded-xl">
                  <DropdownMenuLabel>
                    <Link
                      href="/"
                      className="flex items-center justify-center"
                      onClick={() => handleChangeStatusOpen(false)}>
                      <span className="font-heading uppercase tracking-wide">
                        {siteConfig.name}
                      </span>
                    </Link>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {items?.map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      asChild
                      className="items-center justify-center">
                      {item.href && (
                        <Link
                          href={item.href}
                          onClick={() => handleChangeStatusOpen(false)}>
                          <span
                            className={cn(
                              'line-clamp-1 text-foreground/60 hover:text-foreground/80',
                              path === item.href &&
                                'font-semibold text-foreground',
                            )}>
                            {item.title}
                          </span>
                        </Link>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-2 shadow-sm backdrop-blur">
          <StarSearchToggle
            enabled={enableStarSearch}
            onToggle={toggleStarSearch}
          />
          <DebouncedInput
            id="search-input"
            open={searchStore.isOpen}
            value={searchStore.query}
            onChange={searchShowsByQuery}
            onChangeStatusOpen={handleChangeStatusOpen}
            containerClassName="flex"
          />
          <Link href="/settings" aria-label="Settings">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Icons.settings className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </Link>
          <div className="rounded-full border border-border/60 bg-background/70 p-1">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default MainNav;
