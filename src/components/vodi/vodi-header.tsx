'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Menu, X, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/configs/site';
import { useSearchStore } from '@/stores/search';

const vodiNavLinks = [
  { title: 'Home', href: '/vodi' },
  { title: 'Movies', href: '/movies' },
  { title: 'TV Shows', href: '/tv-shows' },
  { title: 'Trending', href: '/vodi#trending' },
  { title: 'Top Rated', href: '/vodi#top-rated' },
];

export function VodiHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const searchStore = useSearchStore();

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    const setIsScrolled = (v: boolean) => setScrolled(v);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          'vodi-header fixed left-0 right-0 top-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[#0a0a0a]/95 shadow-xl backdrop-blur-md'
            : 'bg-gradient-to-b from-[#0a0a0a] to-transparent',
        )}>
        <div className="sm:h-18 flex h-16 items-center justify-between px-4 sm:px-8 lg:px-16">
          {/* Logo */}
          <Link href="/vodi" className="vodi-logo flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-[#e63946]">
              <Play className="h-4 w-4 fill-white text-white" />
            </span>
            <span className="font-outfit text-lg font-bold uppercase tracking-wider text-white">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-6 lg:flex"
            aria-label="Primary navigation">
            {vodiNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="vodi-nav-link text-sm font-medium text-white/80 transition-colors hover:text-white">
                {link.title}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Search"
              onClick={() => searchStore.setQuery(' ')}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              <Search className="h-[18px] w-[18px]" />
            </button>

            <Link
              href="/home"
              className="hidden rounded bg-[#e63946] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 sm:block">
              Browse All
            </Link>

            {/* Mobile menu button */}
            <button
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden">
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-[#0a0a0a] pt-16 lg:hidden">
          <nav
            className="flex flex-col px-6 py-8"
            aria-label="Mobile navigation">
            {vodiNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-white/10 py-4 text-base font-medium text-white/80 transition-colors hover:text-white">
                {link.title}
              </Link>
            ))}
            <Link
              href="/home"
              onClick={() => setMobileOpen(false)}
              className="mt-6 inline-flex items-center justify-center rounded bg-[#e63946] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white">
              Browse All
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
