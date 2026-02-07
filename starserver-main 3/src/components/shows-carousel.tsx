'use client';

import { MediaType, type Show } from '@/types';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn, getNameFromShow, getSlug } from '@/lib/utils';
import Link from 'next/link';
import CustomImage from './custom-image';

interface ShowsCarouselProps {
  title: string;
  shows: Show[];
}

const ShowsCarousel = ({ title, shows }: ShowsCarouselProps) => {
  const showsRef = React.useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);

  // handle scroll to left and right
  const scrollToDirection = (direction: 'left' | 'right') => {
    if (!showsRef.current) return;

    setIsScrollable(true);
    const { scrollLeft, offsetWidth } = showsRef.current;
    const handleSize = offsetWidth > 1400 ? 60 : 0.04 * offsetWidth;
    const offset =
      direction === 'left'
        ? scrollLeft - (offsetWidth - 2 * handleSize)
        : scrollLeft + (offsetWidth - 2 * handleSize);
    showsRef.current.scrollTo({ left: offset, behavior: 'smooth' });

    if (scrollLeft === 0 && direction === 'left') {
      showsRef.current.scrollTo({
        left: showsRef.current.scrollWidth,
        behavior: 'smooth',
      });
    } else if (
      scrollLeft + offsetWidth === showsRef.current.scrollWidth &&
      direction === 'right'
    ) {
      showsRef.current.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section aria-label="Carousel of shows" className="relative">
      {shows.length !== 0 && (
        <div className="border-white/15 relative overflow-hidden rounded-[28px] border bg-black/50 shadow-[0_22px_90px_-60px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition">
          <div
            className="bg-white/8 pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-black/30"
            aria-hidden="true"
          />
          <div className="relative z-10 flex items-center justify-between px-[4%] py-4 sm:py-5 2xl:px-[52px]">
            <h2 className="m-0 text-lg font-semibold text-white sm:text-xl">
              {title ?? '-'}
            </h2>
            <div className="bg-white/12 hidden items-center gap-2 rounded-full border border-white/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-[0_14px_50px_-32px_rgba(0,0,0,0.75)] backdrop-blur-lg sm:flex">
              <Icons.chevronRight className="h-3.5 w-3.5" />
              Glide
            </div>
          </div>
          <div className="relative z-10 w-full items-center justify-center overflow-hidden px-[4%] pb-5 2xl:px-[52px] 2xl:pb-8">
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
                <Icons.chevronLeft className="h-7 w-7" aria-hidden="true" />
              </Button>
              <div
                ref={showsRef}
                className="no-scrollbar relative m-0 grid auto-cols-[calc(100%/2.2)] grid-flow-col gap-2 overflow-x-auto overflow-y-hidden px-3 py-5 duration-500 ease-in-out sm:auto-cols-[25%] sm:gap-3 md:touch-pan-y lg:auto-cols-[20%] xl:auto-cols-[calc(100%/6)]">
                {shows.map((show) => (
                  <ShowCard key={show.id} show={show} />
                ))}
              </div>
              <Button
                aria-label="Scroll to right"
                variant="ghost"
                className="absolute right-0 top-0 z-10 hidden h-full w-[4.5%] min-w-[52px] items-center justify-center rounded-none bg-white/5 text-white/70 shadow-[0_20px_70px_-52px_rgba(0,0,0,0.9)] backdrop-blur md:flex"
                onClick={() => scrollToDirection('right')}>
                <Icons.chevronRight className="h-7 w-7" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShowsCarousel;

export const ShowCard = ({ show }: { show: Show }) => {
  const imageOnErrorHandler = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    event.currentTarget.src = '/images/grey-thumbnail.jpg';
  };

  const mediaType = show.media_type ?? MediaType.MOVIE;

  const detailPath = `/${
    mediaType === MediaType.TV ? 'tv-shows' : 'movies'
  }/${getSlug(show.id, getNameFromShow(show))}`;

  return (
    <Link
      href={detailPath}
      aria-label={getNameFromShow(show)}
      className="border-white/15 group relative block h-full overflow-hidden rounded-3xl border bg-black/40 text-white shadow-[0_18px_80px_-60px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition hover:-translate-y-1 hover:shadow-[0_30px_120px_-80px_rgba(0,0,0,0.9)]">
      <div className="bg-white/8 absolute inset-0" />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative aspect-[2/3] overflow-hidden">
        <CustomImage
          src={
            show.poster_path ?? show.backdrop_path
              ? `https://image.tmdb.org/t/p/w500${
                  show.poster_path ?? show.backdrop_path
                }`
              : '/images/grey-thumbnail.jpg'
          }
          alt={show.title ?? show.name ?? 'poster'}
          className="h-full w-full cursor-pointer object-cover transition duration-500 group-hover:scale-[1.04]"
          fill
          sizes="(max-width: 768px) 60vw, (max-width: 1200px) 45vw, 20vw"
          onError={imageOnErrorHandler}
          priority={false}
        />
        <div className="bg-white/12 group-hover:bg-white/16 absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl border border-white/20 px-3 py-2 text-[11px] font-semibold text-white shadow-[0_10px_40px_-28px_rgba(0,0,0,0.95)] backdrop-blur-md transition">
          <span className="line-clamp-1">{getNameFromShow(show)}</span>
          <Icons.chevronRight className="h-4 w-4 text-white/70" />
        </div>
      </div>
    </Link>
  );
};
