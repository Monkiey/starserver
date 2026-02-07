'use client';

import Link from 'next/link';
import * as React from 'react';

import CustomImage from '@/components/custom-image';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  mergeContinueWatchingEntries,
  parseContinueWatchingEntries,
  removeContinueWatchingEntry,
} from '@/lib/continue-watching';
import { cn, getNameFromShow } from '@/lib/utils';
import { useSearchStore } from '@/stores/search';
import { MediaType, type ContinueWatchingEntry, type Show } from '@/types';

const ContinueWatching = () => {
  const query = useSearchStore((state) => state.query);
  const [items, setItems] = React.useState<ContinueWatchingEntry[]>([]);
  const itemsRef = React.useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);
  const trimmedQuery = query.trim();

  const scrollToDirection = (direction: 'left' | 'right') => {
    if (!itemsRef.current) return;

    setIsScrollable(true);
    const { scrollLeft, offsetWidth } = itemsRef.current;
    const handleSize = offsetWidth > 1400 ? 60 : 0.04 * offsetWidth;
    const offset =
      direction === 'left'
        ? scrollLeft - (offsetWidth - 2 * handleSize)
        : scrollLeft + (offsetWidth - 2 * handleSize);

    itemsRef.current.scrollTo({ left: offset, behavior: 'smooth' });

    if (scrollLeft === 0 && direction === 'left') {
      itemsRef.current.scrollTo({
        left: itemsRef.current.scrollWidth,
        behavior: 'smooth',
      });
    } else if (
      scrollLeft + offsetWidth === itemsRef.current.scrollWidth &&
      direction === 'right'
    ) {
      itemsRef.current.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }
  };

  React.useEffect(() => {
    if (typeof window === 'undefined' || trimmedQuery.length) return;
    const localEntries = parseContinueWatchingEntries(
      localStorage.getItem('continueWatching'),
    );
    const merged = mergeContinueWatchingEntries(localEntries, []);
    setItems(merged);

    if (merged.length) {
      localStorage.setItem('continueWatching', JSON.stringify(merged));
    }
  }, [trimmedQuery]);

  if (trimmedQuery.length || !items.length) return null;

  const handleRemove = (watchUrl: string) => {
    setItems((prev) => {
      const next = removeContinueWatchingEntry(prev, watchUrl);
      if (typeof window !== 'undefined') {
        localStorage.setItem('continueWatching', JSON.stringify(next));
      }
      return next;
    });
  };

  return (
    <section aria-label="Continue watching" className="relative px-[4%] pt-6">
      <div className="border-white/15 relative overflow-hidden rounded-[28px] border bg-black/50 shadow-[0_22px_90px_-60px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition">
        <div
          className="bg-white/8 pointer-events-none absolute inset-0"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-black/30"
          aria-hidden
        />
        <div className="relative z-10 flex items-center justify-between px-[4%] py-4 sm:py-5 2xl:px-[52px]">
          <div className="flex items-center gap-2 text-white">
            <Icons.play className="h-5 w-5 text-white/80" aria-hidden />
            <h2 className="text-lg font-semibold sm:text-xl">
              Continue Watching
            </h2>
          </div>
          <div className="bg-white/12 hidden items-center gap-2 rounded-full border border-white/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-[0_14px_50px_-32px_rgba(0,0,0,0.75)] backdrop-blur-lg sm:flex">
            <Icons.chevronRight className="h-3.5 w-3.5" aria-hidden />
            Glide
          </div>
        </div>
        <div className="relative z-10 w-full items-center justify-center overflow-hidden px-[4%] pb-8 2xl:px-[52px]">
          <div className="border-white/18 relative overflow-hidden rounded-3xl border bg-black/50 shadow-[0_18px_80px_-60px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <div className="border-white/12 pointer-events-none absolute inset-0 rounded-3xl border" />
            <Button
              aria-label="Scroll to left"
              variant="ghost"
              className={cn(
                'absolute left-0 top-0 z-10 hidden h-full w-[4.5%] min-w-[52px] items-center justify-center rounded-none bg-white/5 text-white/70 shadow-[0_20px_70px_-52px_rgba(0,0,0,0.9)] backdrop-blur md:flex',
                isScrollable ? 'md:flex' : 'md:hidden',
              )}
              onClick={() => scrollToDirection('left')}>
              <Icons.chevronLeft className="h-7 w-7" aria-hidden />
            </Button>
            <div
              ref={itemsRef}
              className="no-scrollbar relative m-0 grid auto-cols-[calc(100%/1.4)] grid-flow-col gap-3 overflow-x-auto overflow-y-hidden px-3 py-5 duration-500 ease-in-out sm:auto-cols-[calc(100%/2)] md:touch-pan-y lg:auto-cols-[calc(100%/3)] xl:auto-cols-[calc(100%/4)] 2xl:auto-cols-[calc(100%/5.2)]">
              {items.map((item) => (
                <ContinueWatchingCard
                  key={`${item.media_type}-${item.id}-${item.watchUrl}`}
                  item={item}
                  onRemove={handleRemove}
                />
              ))}
            </div>
            <Button
              aria-label="Scroll to right"
              variant="ghost"
              className="absolute right-0 top-0 z-10 hidden h-full w-[4.5%] min-w-[52px] items-center justify-center rounded-none bg-white/5 text-white/70 shadow-[0_20px_70px_-52px_rgba(0,0,0,0.9)] backdrop-blur md:flex"
              onClick={() => scrollToDirection('right')}>
              <Icons.chevronRight className="h-7 w-7" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContinueWatching;

const ContinueWatchingCard = ({
  item,
  onRemove,
}: {
  item: ContinueWatchingEntry;
  onRemove: (watchUrl: string) => void;
}) => {
  const mediaType = item.media_type ?? MediaType.MOVIE;
  const title = getNameFromShow({
    ...item,
    media_type: mediaType,
  } as Show);
  const href = React.useMemo(() => {
    if (!item.playbackPosition) return item.watchUrl;

    const base =
      typeof window !== 'undefined' ? window.location.origin : undefined;
    try {
      const url = new URL(item.watchUrl, base ?? 'http://localhost');
      url.searchParams.set('t', Math.floor(item.playbackPosition).toString());
      return `${url.pathname}${url.search}`;
    } catch (error) {
      return item.watchUrl;
    }
  }, [item.playbackPosition, item.watchUrl]);

  return (
    <Link
      href={href}
      className="border-white/15 group relative block h-full overflow-hidden rounded-3xl border bg-black/40 text-white shadow-[0_18px_80px_-60px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition hover:-translate-y-1 hover:shadow-[0_30px_120px_-80px_rgba(0,0,0,0.9)]"
      aria-label={title}>
      <div className="bg-white/8 absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-black/60" />
      <button
        type="button"
        aria-label="Remove from continue watching"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove(item.watchUrl);
        }}
        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/80 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur transition hover:border-white/40 hover:bg-black/60 hover:text-white">
        <Icons.x className="h-4 w-4" aria-hidden />
      </button>
      <div className="relative aspect-[2/3] overflow-hidden">
        <CustomImage
          src={
            item.poster_path ?? item.backdrop_path
              ? `https://image.tmdb.org/t/p/w500${
                  item.poster_path ?? item.backdrop_path
                }`
              : '/images/grey-thumbnail.jpg'
          }
          alt={title ?? 'poster'}
          className="h-full w-full cursor-pointer object-cover transition duration-500 group-hover:scale-[1.04]"
          fill
          sizes="(max-width: 768px) 70vw, (max-width: 1200px) 45vw, 28vw"
          priority={false}
        />
        <div className="bg-white/12 group-hover:bg-white/16 absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl border border-white/20 px-3 py-2 text-[11px] font-semibold text-white shadow-[0_10px_40px_-28px_rgba(0,0,0,0.95)] backdrop-blur-md transition">
          <span className="line-clamp-1">{title}</span>
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-white/80">
            <Icons.play className="h-3.5 w-3.5" />
            Resume
          </span>
        </div>
      </div>
    </Link>
  );
};
