'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Star, Clock } from 'lucide-react';
import { cn, getNameFromShow, getSlug, getYear } from '@/lib/utils';
import { MediaType, type Show } from '@/types';
import CustomImage from '@/components/custom-image';

interface VodiFeaturedGridProps {
  id?: string;
  shows: Show[];
  title?: string;
  className?: string;
}

function FeaturedLargeCard({ show }: { show: Show }) {
  const title = getNameFromShow(show);
  const slug = getSlug(show.id, title);
  const year = getYear(show.release_date ?? show.first_air_date ?? '');
  const rating = show.vote_average ? show.vote_average.toFixed(1) : null;
  const watchHref =
    show.media_type === MediaType.MOVIE
      ? `/watch/movie/${slug}`
      : `/watch/tv/${slug}`;

  return (
    <Link
      href={watchHref}
      className="vodi-featured-card group relative block overflow-hidden rounded-lg">
      <div className="relative aspect-video w-full overflow-hidden">
        <CustomImage
          src={`https://image.tmdb.org/t/p/w780${
            show.backdrop_path ?? show.poster_path ?? ''
          }`}
          alt={title ?? 'featured'}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e63946] shadow-lg shadow-[#e63946]/40">
            <Play className="h-6 w-6 fill-white text-white" />
          </span>
        </div>

        {/* Type badge */}
        <span className="absolute right-3 top-3 rounded bg-[#e63946] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
          {show.media_type === MediaType.MOVIE ? 'Movie' : 'Series'}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="mb-1 truncate font-outfit text-sm font-semibold text-white group-hover:text-[#e63946]">
          {title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-white/50">
          {year > 1970 && <span>{year}</span>}
          {rating && (
            <span className="flex items-center gap-1 text-[#f5c518]">
              <Star className="h-3 w-3 fill-current" />
              {rating}
            </span>
          )}
          {show.runtime && show.media_type === MediaType.MOVIE && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {Math.floor(show.runtime / 60)}h {show.runtime % 60}m
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function VodiFeaturedGrid({
  id,
  shows,
  title,
  className,
}: VodiFeaturedGridProps) {
  if (!shows.length) return null;

  return (
    <section
      id={id}
      aria-label={title ?? 'Featured'}
      className={cn('vodi-section', className)}>
      {title && (
        <div className="mb-4 flex items-center gap-3 px-4 sm:px-8 lg:px-16">
          <span className="vodi-section-accent" aria-hidden="true" />
          <h2 className="font-outfit text-lg font-bold uppercase tracking-wider text-white sm:text-xl">
            {title}
          </h2>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-16 xl:grid-cols-4">
        {shows.slice(0, 8).map((show) => (
          <FeaturedLargeCard key={show.id} show={show} />
        ))}
      </div>
    </section>
  );
}
