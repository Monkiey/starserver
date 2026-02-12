'use client';

import React from 'react';
import { type NavItem } from '@/types';
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

interface MainNavProps {
  items?: NavItem[];
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
    }
  }, [searchStore]);

  React.useEffect(() => {
    window.addEventListener('popstate', handlePopstateEvent, false);
    return () => {
      window.removeEventListener('popstate', handlePopstateEvent, false);
    };
  }, [handlePopstateEvent]);

  function searchShowsByQuery(value: string): void {
    const normalizedValue = value?.trim() ?? '';
    if (!normalizedValue.length) {
      if (path === '/search') {
        router.push('/');
      } else {
        window.history.pushState(null, '', path);
      }
      return;
    }

    if (normalizedValue === searchStore.query) {
      return;
    }

    searchStore.setLoading(true);
    router.push(`/search?q=${encodeURIComponent(normalizedValue)}`);
    searchStore.setQuery(normalizedValue);
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
          <DebouncedInput
            id="search-input"
            open={searchStore.isOpen}
            value={searchStore.query}
            onChange={searchShowsByQuery}
            onChangeStatusOpen={handleChangeStatusOpen}
            containerClassName="flex"
          />
          <div className="rounded-full border border-border/60 bg-background/70 p-1">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default MainNav;
