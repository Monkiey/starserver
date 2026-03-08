'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Show } from '@/types';
import { VodiMovieCard } from './vodi-movie-card';

interface VodiSectionProps {
  id?: string;
  title: string;
  shows: Show[];
  seeAllHref?: string;
  ranked?: boolean;
  className?: string;
}

export function VodiSection({
  id,
  title,
  shows,
  seeAllHref,
  ranked = false,
  className,
}: VodiSectionProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.offsetWidth < el.scrollWidth - 8);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.offsetWidth * 0.8;
    el.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!shows.length) return null;

  return (
    <section
      id={id}
      aria-label={title}
      className={cn('vodi-section relative', className)}>
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between px-4 sm:px-8 lg:px-16">
        <div className="flex items-center gap-3">
          <span className="vodi-section-accent" aria-hidden="true" />
          <h2 className="font-outfit text-lg font-bold uppercase tracking-wider text-white sm:text-xl">
            {title}
          </h2>
        </div>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#e63946] transition-opacity hover:opacity-80">
            See All
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Scroll container wrapper */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            aria-label={`Scroll ${title} left`}
            onClick={() => scroll('left')}
            className="vodi-scroll-btn left-0">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Cards row */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-8 lg:px-16">
          {shows.slice(0, 20).map((show, i) => (
            <VodiMovieCard
              key={show.id}
              show={show}
              rank={ranked ? i + 1 : undefined}
              className="w-[140px] flex-shrink-0 sm:w-[160px] lg:w-[180px]"
            />
          ))}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            aria-label={`Scroll ${title} right`}
            onClick={() => scroll('right')}
            className="vodi-scroll-btn right-0">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </section>
  );
}
