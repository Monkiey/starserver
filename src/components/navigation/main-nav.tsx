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
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [starSearchEnabled, setStarSearchEnabled] = React.useState(false);
  const { enableStarSearch } = useStarSettingsStore();

  // Handle star search toggle - re-run search when toggled
  const handleStarSearchToggle = React.useCallback(
    (enabled: boolean) => {
      setStarSearchEnabled(enabled);
      // Re-run the search with the current query if we have one
      if (searchStore.query && searchStore.query.trim().length > 0) {
        void searchShowsByQuery(searchStore.query);
      }
    },
    [searchStore.query, searchShowsByQuery],
  );

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
      MovieService.searchMovies(search)
        .then((response: SearchResult) => {
          void searchStore.setShows(response.results);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => searchStore.setLoading(false));
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
      let shows;
      if (starSearchEnabled) {
        // Use Star-enhanced search
        const response = await fetch('/api/ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: normalizedValue }),
        });

        if (!response.ok) {
          throw new Error('Star search failed');
        }

        const data = (await response.json()) as {
          results: Show[];
        };
        shows = { results: data.results };
      } else {
        // Use regular search
        shows = await MovieService.searchMovies(normalizedValue);
      }

      searchStore.setLoading(false);
      void searchStore.setShows(shows.results);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to regular search on error
      const shows = await MovieService.searchMovies(normalizedValue);
      searchStore.setLoading(false);
      void searchStore.setShows(shows.results);
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
              <span className="inline-block font-semibold">
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
                    <span className="text-base font-semibold">Menu</span>
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
                      <span className="">{siteConfig.name}</span>
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
          <DebouncedInput
            id="search-input"
            open={searchStore.isOpen}
            value={searchStore.query}
            onChange={searchShowsByQuery}
            onChangeStatusOpen={handleChangeStatusOpen}
            containerClassName="flex"
          />
          {searchStore.isOpen && enableStarSearch && (
            <StarSearchToggle
              enabled={starSearchEnabled}
              onToggle={handleStarSearchToggle}
            />
          )}
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
