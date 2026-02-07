'use client';

import React from 'react';
import { type Show, type NavItem } from '@/types';
import Link from 'next/link';
import {
  cn,
  filterSearchableShows,
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
import { DebouncedInput } from '@/components/debounced-input';
import MovieService from '@/services/MovieService';

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
          const results = filterSearchableShows(response.results);

          void searchStore.setShows(results);
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
    if (!value?.trim()?.length) {
      if (path === '/search') {
        router.push('/');
      } else {
        window.history.pushState(null, '', path);
      }
      return;
    }

    if (getSearchValue('q')?.trim()?.length) {
      window.history.replaceState(null, '', `search?q=${value}`);
    } else {
      window.history.pushState(null, '', `search?q=${value}`);
    }

    searchStore.setQuery(value);
    searchStore.setLoading(true);
    const shows = await MovieService.searchMovies(value);
    searchStore.setLoading(false);
    const filteredShows = filterSearchableShows(shows.results);

    void searchStore.setShows(filteredShows);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // change background color on scroll
  React.useEffect(() => {
    const changeBgColor = () => {
      const y = window.scrollY;
      setIsScrolled(y > 0);
    };
    window.addEventListener('scroll', changeBgColor);
    changeBgColor();
    return () => window.removeEventListener('scroll', changeBgColor);
  }, []);

  const handleChangeStatusOpen = (value: boolean): void => {
    if (!value) searchStore.reset();
    searchStore.setOpen(true);
  };

  return (
    <nav
      className={cn(
        'pointer-events-auto relative mx-auto w-full max-w-5xl text-white transition-all duration-500',
        isScrolled && 'shadow-none',
      )}>
      <div className="relative z-10 flex w-full items-center justify-between gap-3">
        <div className="border-white/15 flex items-center gap-4 rounded-full border bg-white/10 px-4 py-2 shadow-[0_22px_90px_-60px_rgba(0,0,0,0.65)] backdrop-blur md:gap-8 md:px-6 md:py-2.5">
          <Link
            href="/"
            className="hidden md:block"
            onClick={() => handleChangeStatusOpen(false)}>
            <div className="flex items-center gap-3 text-sm font-semibold text-white">
              <Icons.logo className="h-5 w-5" aria-hidden="true" />
              <span className="inline-block text-white/90">
                {siteConfig.name}
              </span>
              <span className="sr-only">Home</span>
            </div>
          </Link>
          {items?.length ? (
            <nav className="hidden items-center gap-2 md:flex">
              {items?.map(
                (item, index) =>
                  item.href && (
                    <Link
                      key={index}
                      href={item.href}
                      className={cn(
                        'hover:bg-white/15 rounded-full border px-3 py-1 text-sm font-semibold text-white/90 transition hover:-translate-y-[1px] hover:border-white/30 hover:text-white',
                        'border-white/15 bg-white/10 shadow-[0_14px_60px_-45px_rgba(0,0,0,0.55)] backdrop-blur',
                        path === item.href &&
                          'border-white/25 bg-white/20 text-white shadow-[0_14px_50px_-38px_rgba(0,0,0,0.7)]',
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
                  className="border-white/15 flex items-center gap-2 rounded-full border bg-white/10 px-3 py-1.5 text-base font-semibold text-white shadow-[0_16px_60px_-45px_rgba(0,0,0,0.7)] transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-primary/30">
                  <Icons.logo className="h-5 w-5" />
                  <span>Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={12}
                className="w-60 overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-2 text-white shadow-[0_18px_80px_-60px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <DropdownMenuLabel>
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white"
                    onClick={() => handleChangeStatusOpen(false)}>
                    <Icons.logo className="h-4 w-4" aria-hidden="true" />
                    <span>{siteConfig.name}</span>
                  </Link>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {items?.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    asChild
                    className="rounded-xl px-2 py-2 text-center hover:bg-white/10">
                    {item.href && (
                      <Link
                        href={item.href}
                        onClick={() => handleChangeStatusOpen(false)}>
                        <span
                          className={cn(
                            'line-clamp-1 text-white/80 transition hover:text-white',
                            path === item.href && 'font-semibold text-white',
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
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 shadow-[0_22px_90px_-60px_rgba(0,0,0,0.65)] backdrop-blur md:px-4 md:py-2.5">
          <DebouncedInput
            id="search-input"
            open
            value={searchStore.query}
            onChange={searchShowsByQuery}
            onChangeStatusOpen={handleChangeStatusOpen}
          />
        </div>
      </div>
    </nav>
  );
}

export default MainNav;
