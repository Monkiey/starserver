'use client';

import React from 'react';
import { type NavItem } from '@/types';
import Link from 'next/link';
import { cn, isShowDetailPage } from '@/lib/utils';
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
import { usePathname } from 'next/navigation';
import { useSearchStore } from '@/stores/search';
import { ModeToggle as ThemeToggle } from '@/components/theme-toggle';

interface MainNavProps {
  items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const path = usePathname();
  const searchStore = useSearchStore();
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Disable search on movie/TV show detail pages to avoid modal conflicts
  const isDetailPage = isShowDetailPage(path);

  // change background color on scroll
  React.useEffect(() => {
    const changeBgColor = () => {
      window.scrollY > 0 ? setIsScrolled(true) : setIsScrolled(false);
    };
    window.addEventListener('scroll', changeBgColor);
    return () => window.removeEventListener('scroll', changeBgColor);
  }, [isScrolled]);

  return (
    <nav
      className={cn(
        'relative z-50 w-full transition-colors duration-300 md:sticky',
        isScrolled ? 'bg-background/80 backdrop-blur' : 'bg-transparent',
      )}>
      <div className="mx-auto flex w-full items-center justify-between px-[4vw] py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 rounded-full border border-border/60 bg-background/80 px-4 py-2 shadow-sm backdrop-blur">
            <Link href="/" className="hidden items-center space-x-2 md:flex">
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
                        )}>
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
                    <Link href="/" className="flex items-center justify-center">
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
                        <Link href={item.href}>
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
          {!isDetailPage && (
            <Button
              variant="ghost"
              className="flex h-9 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => searchStore.setOpen(true)}
              aria-label="Search">
              <Icons.search className="h-4 w-4" />
              <span className="hidden sm:inline-flex">Search</span>
              <kbd className="pointer-events-none hidden select-none rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
                ⌘K
              </kbd>
            </Button>
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
