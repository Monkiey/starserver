'use client';

import React from 'react';
import Link from 'next/link';
import { type Show, MediaType } from '@/types';
import { Icons } from '@/components/icons';
import { cn, getNameFromShow, getSlug } from '@/lib/utils';
import { useModalStore } from '@/stores/modal';
import CustomImage from './custom-image';

/** Shows released within this window are flagged as "New" */
const NEW_RELEASE_THRESHOLD_MS = 180 * 24 * 60 * 60 * 1000;

interface HomeGridSectionProps {
  title: string;
  shows: Show[];
  /** When true the first card becomes a wide bento feature card */
  featured?: boolean;
  viewAllHref?: string;
}

// ── Section component ────────────────────────────────────────────
const HomeGridSection = ({
  title,
  shows,
  featured = false,
  viewAllHref,
}: HomeGridSectionProps) => {
  if (!shows.length) return null;

  if (featured) {
    const [featuredShow, ...rest] = shows;
    // Bento row: featured card (col-span-2) + up to 4 small cards
    const bentoCards = rest.slice(0, 4);
    // Regular grid below: next 12 shows
    const gridCards = rest.slice(4, 16);

    return (
      <section
        aria-label={`${title} section`}
        className="px-4 py-4 sm:px-6 lg:px-8">
        <SectionHeader title={title} viewAllHref={viewAllHref} />

        {/* Bento row */}
        <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-4">
          {/* Wide feature card – col-span-2 */}
          <div className="col-span-2">
            <BentoFeatureCard show={featuredShow} />
          </div>
          {/* Small portrait cards – 2×2 grid */}
          <div
            className={cn(
              'col-span-1 grid grid-cols-1 gap-3',
              'sm:col-span-2 sm:grid-cols-2',
            )}>
            {bentoCards.map((show) => (
              <GridCard key={show.id} show={show} />
            ))}
          </div>
        </div>

        {/* Standard grid below the bento row */}
        {gridCards.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {gridCards.map((show) => (
              <GridCard key={show.id} show={show} />
            ))}
          </div>
        )}
      </section>
    );
  }

  // Standard section – uniform grid, no featured card
  const gridCards = shows.slice(0, 18);

  return (
    <section
      aria-label={`${title} section`}
      className="px-4 py-4 sm:px-6 lg:px-8">
      <SectionHeader title={title} viewAllHref={viewAllHref} />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {gridCards.map((show) => (
          <GridCard key={show.id} show={show} />
        ))}
      </div>
    </section>
  );
};

export default HomeGridSection;

// ── Section header ───────────────────────────────────────────────
const SectionHeader = ({
  title,
  viewAllHref,
}: {
  title: string;
  viewAllHref?: string;
}) => (
  <div className="mb-3 flex items-center justify-between">
    <h2 className="movieasap-section-title font-outfit text-base font-semibold uppercase tracking-wide sm:text-lg">
      {title}
    </h2>
    {viewAllHref && (
      <Link
        href={viewAllHref}
        className="text-xs font-medium text-primary transition-opacity hover:opacity-80">
        View All →
      </Link>
    )}
  </div>
);

// ── Wide bento feature card (uses backdrop image) ────────────────
const BentoFeatureCard = ({ show }: { show: Show }) => {
  const imageOnErrorHandler = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    event.currentTarget.src = '/images/grey-thumbnail.jpg';
  };

  const releaseYear =
    show.release_date ?? show.first_air_date
      ? new Date((show.release_date ?? show.first_air_date)!).getFullYear()
      : null;

  const isNew = React.useMemo(() => {
    const date = show.release_date ?? show.first_air_date;
    if (!date) return false;
    const diff = Date.now() - new Date(date).getTime();
    return diff >= 0 && diff < NEW_RELEASE_THRESHOLD_MS;
  }, [show.release_date, show.first_air_date]);

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl"
      style={{ aspectRatio: '16/9' }}
      onClick={() => {
        const name = getNameFromShow(show);
        const path = show.media_type === MediaType.TV ? 'tv-shows' : 'movies';
        window.history.pushState(null, '', `${path}/${getSlug(show.id, name)}`);
        useModalStore.setState({ show, open: true, play: true });
      }}>
      <CustomImage
        src={
          show.backdrop_path ?? show.poster_path
            ? `https://image.tmdb.org/t/p/w780${
                show.backdrop_path ?? show.poster_path
              }`
            : '/images/grey-thumbnail.jpg'
        }
        alt={getNameFromShow(show) ?? 'poster'}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        fill
        sizes="(max-width: 768px) 66vw, 45vw"
        onError={imageOnErrorHandler}
      />

      {/* Gradient */}
      <div className="from-black/85 absolute inset-0 bg-gradient-to-t via-black/20 to-transparent" />

      {/* Badges */}
      <div className="absolute left-2 top-2 flex gap-1.5">
        {isNew && (
          <span className="movieasap-new-badge" aria-label="New release">
            New
          </span>
        )}
        <span
          className="movieasap-type-badge"
          aria-label={show.media_type === MediaType.TV ? 'TV' : 'Movie'}>
          {show.media_type === MediaType.TV ? 'TV' : 'Movie'}
        </span>
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="mb-1 flex items-center gap-2">
          {show.vote_average > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-400">
              <Icons.star
                fill="currentColor"
                aria-hidden="true"
                className="h-2.5 w-2.5"
              />
              {show.vote_average.toFixed(1)}
            </span>
          )}
          {releaseYear && (
            <span className="text-[10px] text-white/60">{releaseYear}</span>
          )}
        </div>
        <p className="line-clamp-1 text-sm font-semibold text-white sm:text-base">
          {getNameFromShow(show)}
        </p>
        {show.overview && (
          <p className="mt-0.5 line-clamp-2 text-[10px] text-white/60 sm:text-xs">
            {show.overview}
          </p>
        )}
      </div>

      {/* Hover play icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
          <Icons.play
            className="h-5 w-5 fill-white text-white"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

// ── Standard portrait card ────────────────────────────────────────
export const GridCard = ({ show }: { show: Show }) => {
  const imageOnErrorHandler = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    event.currentTarget.src = '/images/grey-thumbnail.jpg';
  };

  const releaseDate = show.release_date ?? show.first_air_date;
  const isNew = React.useMemo(() => {
    if (!releaseDate) return false;
    const diff = Date.now() - new Date(releaseDate).getTime();
    return diff >= 0 && diff < NEW_RELEASE_THRESHOLD_MS;
  }, [releaseDate]);

  const rating = show.vote_average > 0 ? show.vote_average.toFixed(1) : null;
  const typeLabel = show.media_type === MediaType.TV ? 'TV' : 'Movie';

  return (
    <div className="metal-card-3d relative aspect-[2/3] overflow-hidden rounded-2xl">
      <CustomImage
        src={
          show.poster_path ?? show.backdrop_path
            ? `https://image.tmdb.org/t/p/w500${
                show.poster_path ?? show.backdrop_path
              }`
            : '/images/grey-thumbnail.jpg'
        }
        alt={show.title ?? show.name ?? 'poster'}
        className="h-full w-full cursor-pointer rounded-2xl px-1 transition-all"
        fill
        sizes="(max-width: 768px) 33vw, 15vw"
        style={{ objectFit: 'cover' }}
        onClick={() => {
          const name = getNameFromShow(show);
          const path = show.media_type === MediaType.TV ? 'tv-shows' : 'movies';
          window.history.pushState(
            null,
            '',
            `${path}/${getSlug(show.id, name)}`,
          );
          useModalStore.setState({ show, open: true, play: true });
        }}
        onError={imageOnErrorHandler}
      />

      {isNew && (
        <span className="movieasap-new-badge" aria-label="New release">
          New
        </span>
      )}
      <span className="movieasap-type-badge" aria-label={typeLabel}>
        {typeLabel}
      </span>
      {rating && (
        <span
          className="movieasap-rating-badge"
          aria-label={`Rating: ${rating}`}>
          <Icons.star
            fill="currentColor"
            aria-hidden="true"
            className="h-2.5 w-2.5 text-yellow-400"
          />
          {rating}
        </span>
      )}
    </div>
  );
};
