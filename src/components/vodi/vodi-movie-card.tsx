'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Star, Plus, ChevronDown } from 'lucide-react';
import { cn, getNameFromShow, getSlug, getYear } from '@/lib/utils';
import { MediaType, type Show } from '@/types';
import CustomImage from '@/components/custom-image';
import { useModalStore } from '@/stores/modal';

interface VodiMovieCardProps {
  show: Show;
  rank?: number;
  className?: string;
}

export function VodiMovieCard({ show, rank, className }: VodiMovieCardProps) {
  const modalStore = useModalStore();
  const title = getNameFromShow(show);
  const slug = getSlug(show.id, title);
  const year = getYear(show.release_date ?? show.first_air_date ?? '');
  const rating = show.vote_average ? show.vote_average.toFixed(1) : null;
  const watchHref =
    show.media_type === MediaType.MOVIE
      ? `/watch/movie/${slug}`
      : `/watch/tv/${slug}`;

  return (
    <div className={cn('vodi-card group relative flex-shrink-0', className)}>
      {/* Rank badge */}
      {rank !== undefined && <span className="vodi-rank-badge">{rank}</span>}

      {/* Poster */}
      <div className="vodi-card-poster">
        <CustomImage
          src={`https://image.tmdb.org/t/p/w342${
            show.poster_path ?? show.backdrop_path ?? ''
          }`}
          alt={title ?? 'poster'}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 40vw, (max-width: 1200px) 20vw, 180px"
        />

        {/* Hover overlay */}
        <div className="vodi-card-overlay">
          <Link
            href={watchHref}
            aria-label={`Play ${title}`}
            className="vodi-play-btn"
            onClick={(e) => e.stopPropagation()}>
            <Play className="h-5 w-5 fill-current" />
          </Link>

          <button
            aria-label={`More info about ${title}`}
            className="vodi-info-btn"
            onClick={() => {
              modalStore.setShow(show);
              modalStore.setOpen(true);
            }}>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Rating badge */}
        {rating && (
          <div className="vodi-rating-badge">
            <Star className="h-2.5 w-2.5 fill-current" />
            <span>{rating}</span>
          </div>
        )}

        {/* Media type badge */}
        <div className="vodi-type-badge">
          {show.media_type === MediaType.MOVIE ? 'Movie' : 'Series'}
        </div>
      </div>

      {/* Card info */}
      <div className="vodi-card-info">
        <h3 className="vodi-card-title" title={title ?? ''}>
          {title}
        </h3>
        <div className="vodi-card-meta">
          {year > 1970 && <span>{year}</span>}
          {show.runtime && show.media_type === MediaType.MOVIE && (
            <>
              <span className="vodi-dot" />
              <span>
                {Math.floor(show.runtime / 60)}h {show.runtime % 60}m
              </span>
            </>
          )}
          {show.number_of_seasons && show.media_type === MediaType.TV && (
            <>
              <span className="vodi-dot" />
              <span>
                {show.number_of_seasons}{' '}
                {show.number_of_seasons === 1 ? 'Season' : 'Seasons'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
