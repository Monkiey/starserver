'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Tv,
  Film,
  Search,
  Settings,
  PlayCircle,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/configs/site';
import { ModeToggle as ThemeToggle } from '@/components/theme-toggle';
import { useSearchStore } from '@/stores/search';
import { isShowDetailPage } from '@/lib/utils';

// ─── Nav item definitions ─────────────────────────────────────────
const navItems = [
  { title: 'Home', href: '/', icon: Home },
  { title: 'TV Shows', href: '/tv-shows', icon: Tv },
  { title: 'Movies', href: '/movies', icon: Film },
];

// ─── Component ────────────────────────────────────────────────────
export function VerticalSidebar() {
  const path = usePathname();
  const searchStore = useSearchStore();
  const isDetailPage = isShowDetailPage(path);

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Close sidebar on route change
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [path]);

  // Scroll-aware transparency
  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent body scroll while sidebar is open
  React.useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* ── Top bar (all screen sizes) ─────────────────────────── */}
      <header
        className={cn(
          'fixed left-0 right-0 top-0 z-50 flex h-14 items-center gap-3 px-4 transition-colors duration-300',
          isScrolled
            ? 'border-b border-border/60 bg-background/80 backdrop-blur'
            : 'bg-transparent',
        )}>
        {/* Hamburger */}
        <button
          aria-label="Open navigation"
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-muted hover:text-foreground">
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <PlayCircle className="h-6 w-6 flex-shrink-0 text-primary" />
          <span className="font-heading text-base font-semibold uppercase tracking-wide">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop inline nav links */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                path === item.href
                  ? 'text-foreground'
                  : 'text-foreground/60 hover:bg-muted hover:text-foreground',
              )}>
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1">
          {!isDetailPage && (
            <button
              aria-label="Search"
              onClick={() => searchStore.setOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-muted hover:text-foreground">
              <Search className="h-5 w-5" />
            </button>
          )}
          <Link
            href="/settings"
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-muted hover:text-foreground">
            <Settings className="h-5 w-5" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Overlay (all screen sizes) ─────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Slide-in sidebar panel (all screen sizes) ──────────── */}
      <aside
        role="navigation"
        aria-label="Site navigation"
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col',
          'border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground backdrop-blur-md',
          'overflow-y-auto overflow-x-hidden transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}>
        {/* Header row */}
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/" className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 flex-shrink-0 text-primary" />
            <span className="font-heading text-base font-semibold uppercase tracking-wide">
              {siteConfig.name}
            </span>
          </Link>
          <button
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary navigation */}
        <nav className="flex-1 py-4">
          <p className="text-sidebar-foreground/50 mb-2 px-6 text-[11px] font-semibold uppercase tracking-wider">
            Browse
          </p>
          <ul className="space-y-0.5 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = path === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-primary'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                    )}>
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0 transition-colors',
                        isActive
                          ? 'text-primary'
                          : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground',
                      )}
                    />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="flex-shrink-0 space-y-0.5 border-t border-sidebar-border px-3 py-4">
          {!isDetailPage && (
            <button
              onClick={() => {
                setSidebarOpen(false);
                searchStore.setOpen(true);
              }}
              className="group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
              <Search className="text-sidebar-foreground/50 h-5 w-5 flex-shrink-0 transition-colors group-hover:text-sidebar-foreground" />
              <span>Search</span>
              <kbd className="text-sidebar-foreground/50 ml-auto hidden select-none rounded border bg-sidebar-accent px-1.5 py-0.5 font-mono text-[10px] md:inline-flex">
                ⌘K
              </kbd>
            </button>
          )}

          <Link
            href="/settings"
            className={cn(
              'group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
              path === '/settings'
                ? 'bg-sidebar-accent text-primary'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
            )}>
            <Settings
              className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                path === '/settings'
                  ? 'text-primary'
                  : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground',
              )}
            />
            <span>Settings</span>
          </Link>

          <div className="flex h-11 items-center rounded-lg px-3 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent">
            <span className="flex-1 text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}

export default VerticalSidebar;
