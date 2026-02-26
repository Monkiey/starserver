'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Tv, Film, Search, Settings, Menu, X, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/configs/site';
import { useSearchStore } from '@/stores/search';
import { isShowDetailPage } from '@/lib/utils';

// ─── Nav item definitions ─────────────────────────────────────────
const navItems = [
  { title: 'Home', href: '/', icon: Home },
  { title: 'TV Shows', href: '/tv-shows', icon: Tv },
  { title: 'Movies', href: '/movies', icon: Film },
  { title: 'History', href: '/history', icon: History },
];

// ─── Component ────────────────────────────────────────────────────
export function VerticalSidebar() {
  const path = usePathname();
  const searchStore = useSearchStore();
  const isDetailPage = isShowDetailPage(path);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  // Scroll-aware transparency for the top bar
  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent body scroll while mobile sidebar is open
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // ── Shared sidebar content ────────────────────────────────────
  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      {/* Header row */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-sidebar-border px-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-base font-semibold uppercase tracking-wide">
            {siteConfig.name}
          </span>
        </Link>
        {onClose && (
          <button
            aria-label="Close navigation"
            onClick={onClose}
            className="text-sidebar-foreground/50 flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
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
              // Close mobile drawer before opening search so the dialog has full screen space
              setMobileOpen(false);
              searchStore.setOpen(true);
            }}
            className="text-sidebar-foreground/70 group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
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
      </div>
    </>
  );

  return (
    <>
      {/* ── Top bar ──────────────────────────────────────────────── */}
      {/* On desktop the bar starts at left-[260px] so it never covers the sidebar logo */}
      <header
        className={cn(
          'fixed right-0 top-0 z-50 flex h-16 items-center px-4 transition-colors duration-300',
          'left-0 lg:left-[260px]',
          isScrolled
            ? 'border-border/60 bg-background/80 border-b backdrop-blur'
            : 'bg-transparent',
        )}>
        {/* Mobile hamburger */}
        <button
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
          className="text-foreground/60 mr-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground lg:hidden">
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <span className="font-heading text-base font-semibold uppercase tracking-wide">
            {siteConfig.name}
          </span>
        </Link>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1">
          {!isDetailPage && (
            <button
              aria-label="Search"
              onClick={() => searchStore.setOpen(true)}
              className="text-foreground/60 flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground">
              <Search className="h-5 w-5" />
            </button>
          )}
          <Link
            href="/settings"
            aria-label="Settings"
            className="text-foreground/60 hidden h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground lg:flex">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* ── Desktop persistent sidebar ────────────────────────────── */}
      <aside
        role="navigation"
        aria-label="Site navigation"
        className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ───────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile slide-in sidebar ──────────────────────────────── */}
      <aside
        role="navigation"
        aria-label="Site navigation"
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col lg:hidden',
          'bg-sidebar/95 border-r border-sidebar-border text-sidebar-foreground backdrop-blur-md',
          'overflow-y-auto overflow-x-hidden transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}

export default VerticalSidebar;
