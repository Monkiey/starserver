'use client';

import { useModalStore } from '@/stores/modal';
import { MediaType, type Show } from '@/types';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn, getNameFromShow, getSlug } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import CustomImage from './custom-image';

/** Shows released within this window are flagged as "New" in MovieASAP template */
const NEW_RELEASE_THRESHOLD_MS = 180 * 24 * 60 * 60 * 1000;

interface ShowsCarouselProps {
  /** Optional title for the carousel. When omitted, the carousel renders without a title header. */
  title?: string;
  shows: Show[];
}

const ShowsCarousel = ({ title, shows }: ShowsCarouselProps) => {
  const pathname = usePathname();

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
    <section
      aria-label="Carousel of shows"
      className="relative my-[6vw] p-0 sm:my-[3vw]">
      {shows.length !== 0 && (
        <div className="space-y-1 sm:space-y-2.5">
          {title && (
            <h2 className="movieasap-section-title m-0 px-[4%] font-outfit text-lg font-semibold uppercase tracking-wide sm:text-xl 2xl:px-[60px]">
              {title}
            </h2>
          )}
          <div className="relative w-full items-center justify-center overflow-hidden">
            <Button
              aria-label="Scroll to left"
              variant="ghost"
              className={cn(
                'hover:bg-secondary/90 absolute left-0 top-0 z-10 mr-2 hidden h-full w-[4%] items-center justify-center rounded-l-none bg-transparent py-0 text-transparent hover:text-foreground md:block 2xl:w-[60px]',
                isScrollable ? 'md:block' : 'md:hidden',
              )}
              onClick={() => scrollToDirection('left')}>
              <Icons.chevronLeft className="h-8 w-8" aria-hidden="true" />
            </Button>
            <div
              ref={showsRef}
              className="no-scrollbar m-0 grid auto-cols-[calc(100%/2.2)] grid-flow-col overflow-x-auto overflow-y-hidden px-[4%] py-0 duration-500 ease-in-out xs:auto-cols-[calc(100%/2.6)] sm:auto-cols-[25%] md:touch-pan-y lg:auto-cols-[20%] xl:auto-cols-[calc(100%/6)] 2xl:px-[60px]">
              {shows.map((show) => (
                <ShowCard key={show.id} show={show} pathname={pathname} />
              ))}
            </div>
            <Button
              aria-label="Scroll to right"
              variant="ghost"
              className="hover:bg-secondary/70 absolute right-0 top-0 z-10 m-0 ml-2 hidden h-full w-[4%] items-center justify-center rounded-r-none bg-transparent py-0 text-transparent hover:text-foreground md:block 2xl:w-[60px]"
              onClick={() => scrollToDirection('right')}>
              <Icons.chevronRight className="h-8 w-8" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShowsCarousel;

export const ShowCard = ({ show }: { show: Show; pathname: string }) => {
  const imageOnErrorHandler = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    event.currentTarget.src = '/images/grey-thumbnail.jpg';
  };

  // Determine if the show is "new" (released within the last 180 days)
  const releaseDate = show.release_date ?? show.first_air_date;
  const isNew = React.useMemo(() => {
    if (!releaseDate) return false;
    const diff = Date.now() - new Date(releaseDate).getTime();
    return diff >= 0 && diff < NEW_RELEASE_THRESHOLD_MS;
  }, [releaseDate]);

  const rating =
    show.vote_average > 0 ? show.vote_average.toFixed(1) : null;

  const typeLabel = show.media_type === MediaType.TV ? 'TV' : 'Movie';

  return (
    // <picture className="relative aspect-[2/3] md:aspect-video">
    <picture className="metal-card-3d relative aspect-[2/3] overflow-hidden rounded-3xl">
      <a
        className="pointer-events-none"
        aria-hidden={false}
        role="link"
        aria-label={getNameFromShow(show)}
        href={`/${show.media_type}/${getSlug(show.id, getNameFromShow(show))}`}
      />
      <CustomImage
        src={
          show.poster_path ?? show.backdrop_path
            ? `https://image.tmdb.org/t/p/w500${
                show.poster_path ?? show.backdrop_path
              }`
            : '/images/grey-thumbnail.jpg'
        }
        alt={show.title ?? show.name ?? 'poster'}
        className="h-full w-full cursor-pointer rounded-3xl px-1 transition-all"
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 100vw, 33vw"
        style={{
          objectFit: 'cover',
        }}
        onClick={() => {
          const name = getNameFromShow(show);
          const path: string =
            show.media_type === MediaType.TV ? 'tv-shows' : 'movies';
          window.history.pushState(
            null,
            '',
            `${path}/${getSlug(show.id, name)}`,
          );
          useModalStore.setState({
            show: show,
            open: true,
            play: true,
          });
        }}
        onError={imageOnErrorHandler}
      />

      {/* MovieASAP-style: NEW badge (top-left) */}
      {isNew && (
        <span className="movieasap-new-badge" aria-label="New release">
          New
        </span>
      )}

      {/* MovieASAP-style: media type badge (top-right) */}
      <span className="movieasap-type-badge" aria-label={typeLabel}>
        {typeLabel}
      </span>

      {/* MovieASAP-style: rating badge (bottom-left, visible on hover) */}
      {rating && (
        <span className="movieasap-rating-badge" aria-label={`Rating: ${rating}`}>
          <Icons.star
            fill="currentColor"
            aria-hidden="true"
            className="h-2.5 w-2.5 text-yellow-400"
          />
          {rating}
        </span>
      )}
    </picture>
  );
};
