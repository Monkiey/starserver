'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Plus, Info, Star } from 'lucide-react';
import { cn, getNameFromShow, getSlug, getYear } from '@/lib/utils';
import { MediaType, type Show } from '@/types';
import CustomImage from '@/components/custom-image';

interface VodiHeroProps {
  show: Show | null;
  className?: string;
}

export function VodiHero({ show, className }: VodiHeroProps) {
  const [loaded, setLoaded] = React.useState(false);

  if (!show) return null;

  const title = getNameFromShow(show);
  const slug = getSlug(show.id, title);
  const year = getYear(show.release_date ?? show.first_air_date ?? '');
  const rating = show.vote_average ? (show.vote_average / 2).toFixed(1) : null;
  const watchHref =
    show.media_type === MediaType.MOVIE
      ? `/watch/movie/${slug}`
      : `/watch/tv/${slug}`;

  const backdropUrl = show.backdrop_path
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : show.poster_path
    ? `https://image.tmdb.org/t/p/original${show.poster_path}`
    : null;

  return (
    <section
      aria-label="Featured content"
      className={cn('vodi-hero relative w-full overflow-hidden', className)}>
      {/* Backdrop image */}
      {backdropUrl && (
        <div className="absolute inset-0 z-0">
          <CustomImage
            src={backdropUrl}
            alt={title ?? 'featured'}
            fill
            priority
            className={cn(
              'object-cover object-center transition-opacity duration-700',
              loaded ? 'opacity-100' : 'opacity-0',
            )}
            sizes="100vw"
            onLoad={() => setLoaded(true)}
          />
          {/* Cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/30" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex min-h-[60vh] items-end pb-16 pl-6 pr-6 sm:min-h-[70vh] sm:pl-16 sm:pr-16 lg:min-h-[80vh] lg:pl-24">
        <div className="max-w-xl space-y-4 lg:max-w-2xl">
          {/* Genre / type tag */}
          <div className="flex items-center gap-2">
            <span className="vodi-hero-badge">
              {show.media_type === MediaType.MOVIE ? 'Movie' : 'Series'}
            </span>
            {year > 1970 && (
              <span className="text-sm font-medium text-white/70">{year}</span>
            )}
            {rating && (
              <span className="flex items-center gap-1 text-sm font-semibold text-[#f5c518]">
                <Star className="h-3.5 w-3.5 fill-current" />
                {rating}
                <span className="text-white/50">/5</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="font-outfit text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
            {title}
          </h2>

          {/* Overview */}
          {show.overview && (
            <p className="line-clamp-3 text-sm leading-relaxed text-white/75 sm:text-base lg:max-w-lg">
              {show.overview}
            </p>
          )}

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={watchHref} className="vodi-btn-primary">
              <Play className="h-4 w-4 fill-current" />
              Watch Now
            </Link>
            <button className="vodi-btn-secondary">
              <Plus className="h-4 w-4" />
              Add to List
            </button>
            <button className="vodi-btn-ghost">
              <Info className="h-4 w-4" />
              More Info
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
