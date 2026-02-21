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
  ChevronLeft,
  ChevronRight,
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

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  // Prevent body scroll while mobile sidebar is open
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────── */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center gap-3 border-b border-sidebar-border bg-sidebar px-4 lg:hidden">
        <button
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
          className="text-sidebar-foreground/60 flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <PlayCircle className="h-6 w-6 text-primary" />
          <span className="font-heading text-base font-semibold uppercase tracking-wide">
            {siteConfig.name}
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          {!isDetailPage && (
            <button
              aria-label="Search"
              onClick={() => searchStore.setOpen(true)}
              className="text-sidebar-foreground/60 flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
              <Search className="h-5 w-5" />
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* ── Mobile overlay ─────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar panel ──────────────────────────────────────── */}
      <aside
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          // Base — fixed, full-height sidebar
          'fixed left-0 top-0 z-40 h-screen',
          'border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
          'flex flex-col overflow-y-auto overflow-x-hidden',
          'transition-all duration-300',
          // Desktop: width driven by collapsed state
          sidebarWidth,
          // Mobile: always 260 px wide, off-screen by default
          'max-lg:w-[260px]',
          mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        )}>
        {/* ── Logo + collapse toggle ──────────────────────────── */}
        <div
          className={cn(
            'flex h-14 flex-shrink-0 items-center border-b border-sidebar-border',
            collapsed ? 'justify-center px-0' : 'justify-between px-4',
          )}>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <PlayCircle className="h-6 w-6 flex-shrink-0 text-primary" />
              <span className="font-heading text-base font-semibold uppercase tracking-wide">
                {siteConfig.name}
              </span>
            </Link>
          )}

          {/* Desktop collapse toggle */}
          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              'hidden h-8 w-8 items-center justify-center rounded-lg lg:flex',
              'text-sidebar-foreground/50 flex-shrink-0 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground',
            )}>
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="text-sidebar-foreground/50 flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Primary navigation ─────────────────────────────── */}
        <nav className="flex-1 py-4">
          {/* Category label */}
          {!collapsed && (
            <p className="text-sidebar-foreground/50 mb-2 px-6 text-[11px] font-semibold uppercase tracking-wider">
              Browse
            </p>
          )}

          <ul className="space-y-0.5 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = path === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.title : undefined}
                    className={cn(
                      'group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-primary'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                      collapsed && 'justify-center px-0',
                    )}>
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0 transition-colors',
                        isActive
                          ? 'text-primary'
                          : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground',
                      )}
                    />
                    {!collapsed && <span>{item.title}</span>}

                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block">
                        {item.title}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Bottom actions ─────────────────────────────────── */}
        <div className="flex-shrink-0 space-y-0.5 border-t border-sidebar-border px-3 py-4">
          {/* Search */}
          {!isDetailPage && (
            <button
              onClick={() => searchStore.setOpen(true)}
              title={collapsed ? 'Search' : undefined}
              className={cn(
                'group relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                collapsed && 'justify-center px-0',
              )}>
              <Search className="text-sidebar-foreground/50 h-5 w-5 flex-shrink-0 transition-colors group-hover:text-sidebar-foreground" />
              {!collapsed && <span>Search</span>}
              {!collapsed && (
                <kbd className="text-sidebar-foreground/50 ml-auto hidden select-none rounded border bg-sidebar-accent px-1.5 py-0.5 font-mono text-[10px] md:inline-flex">
                  ⌘K
                </kbd>
              )}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block">
                  Search
                </span>
              )}
            </button>
          )}

          {/* Settings */}
          <Link
            href="/settings"
            title={collapsed ? 'Settings' : undefined}
            className={cn(
              'group relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
              path === '/settings'
                ? 'bg-sidebar-accent text-primary'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
              collapsed && 'justify-center px-0',
            )}>
            <Settings
              className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                path === '/settings'
                  ? 'text-primary'
                  : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground',
              )}
            />
            {!collapsed && <span>Settings</span>}
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block">
                Settings
              </span>
            )}
          </Link>

          {/* Theme toggle */}
          <div
            className={cn(
              'flex h-11 items-center rounded-lg px-3',
              'text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent',
              collapsed && 'justify-center px-0',
            )}>
            {!collapsed && (
              <span className="flex-1 text-sm font-medium">Theme</span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Spacer — keeps desktop content from sliding under sidebar ── */}
      <div
        className={cn(
          'hidden flex-shrink-0 transition-all duration-300 lg:block',
          sidebarWidth,
        )}
      />
    </>
  );
}

export default VerticalSidebar;
