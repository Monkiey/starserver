'use client';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { getIdFromSlug, getNameFromShow, getSlug } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { useModalStore } from '@/stores/modal';
import { useSearchStore } from '@/stores/search';
import { useContinueWatchingStore } from '@/stores/continue-watching';
import { MediaType, type Show } from '@/types';
import { type AxiosResponse } from 'axios';
import Link from 'next/link';
import React from 'react';
import CustomImage from './custom-image';

interface HeroProps {
  randomShow: Show | null;
  hotShows?: Show[];
}

const Hero = ({ randomShow, hotShows = [] }: HeroProps) => {
  const modalStore = useModalStore();
  const searchStore = useSearchStore();
  const continueWatchingStore = useContinueWatchingStore();

  const handlePopstateEvent = React.useCallback(() => {
    const pathname = window.location.pathname;
    if (!/\d/.test(pathname)) {
      modalStore.reset();
    } else if (/\d/.test(pathname)) {
      const movieId: number = getIdFromSlug(pathname);
      if (!movieId) {
        return;
      }
      const findMovie: Promise<AxiosResponse<Show>> = pathname.includes(
        '/tv-shows',
      )
        ? MovieService.findTvSeries(movieId)
        : MovieService.findMovie(movieId);
      findMovie
        .then((response: AxiosResponse<Show>) => {
          const { data } = response;
          useModalStore.setState({ show: data, open: true, play: true });
        })
        .catch((error) => {
          console.error(`findMovie: `, error);
        });
    }
  }, [modalStore]);

  React.useEffect(() => {
    window.addEventListener('popstate', handlePopstateEvent, false);
    return () => {
      window.removeEventListener('popstate', handlePopstateEvent, false);
    };
  }, [handlePopstateEvent]);

  if (searchStore.query.length > 0) {
    return null;
  }

  if (!randomShow) {
    return null;
  }

  const handleHref = (): string => {
    const type = randomShow.media_type === MediaType.MOVIE ? 'movie' : 'tv';
    return `/watch/${type}/${randomShow.id}`;
  };

  const releaseYear =
    randomShow.release_date ?? randomShow.first_air_date
      ? new Date(
          (randomShow.release_date ?? randomShow.first_air_date)!,
        ).getFullYear()
      : null;

  // Up to 4 hot shows displayed to the right of the featured show
  const sideShows = hotShows.filter((s) => s.id !== randomShow.id).slice(0, 4);

  return (
    <section
      aria-label="Hero"
      className="w-full px-4 pb-2 pt-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px] xl:grid-cols-[1fr_260px]">
        {/* ── Featured show card ── */}
        <div className="group relative overflow-hidden rounded-2xl">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <CustomImage
              src={`https://image.tmdb.org/t/p/original${
                randomShow.backdrop_path ?? randomShow.poster_path ?? ''
              }`}
              alt={getNameFromShow(randomShow) ?? 'poster'}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 75vw"
            />
            {/* Bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            {/* Left gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
          </div>

          {/* Overlay content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            {/* Badges row */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                {randomShow.media_type === MediaType.TV ? 'Series' : 'Movie'}
              </span>
              {randomShow.vote_average > 0 && (
                <span className="flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-sm">
                  <Icons.star
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-2.5 w-2.5"
                  />
                  {randomShow.vote_average.toFixed(1)}
                </span>
              )}
              {releaseYear && (
                <span className="text-[10px] font-medium text-white/60">
                  {releaseYear}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-1 line-clamp-2 text-xl font-bold leading-tight text-white sm:text-2xl xl:text-3xl">
              {getNameFromShow(randomShow)}
            </h1>

            {/* Overview */}
            {randomShow.overview && (
              <p className="mb-3 line-clamp-2 text-xs text-white/70 sm:text-sm lg:max-w-[70%]">
                {randomShow.overview}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Link prefetch={false} href={handleHref()}>
                <Button
                  aria-label="Play video"
                  size="sm"
                  className="metal-btn h-8 gap-1.5 rounded-lg px-4 text-xs font-semibold text-primary-foreground"
                  onClick={() => {
                    continueWatchingStore.addItem(randomShow);
                  }}>
                  <Icons.play
                    className="h-3 w-3 fill-current"
                    aria-hidden="true"
                  />
                  Play
                </Button>
              </Link>
              <Button
                aria-label="Open show's details modal"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-lg border-white/20 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                onClick={() => {
                  const name = getNameFromShow(randomShow);
                  const path =
                    randomShow.media_type === MediaType.TV
                      ? 'tv-shows'
                      : 'movies';
                  window.history.pushState(
                    null,
                    '',
                    `${path}/${getSlug(randomShow.id, name)}`,
                  );
                  useModalStore.setState({
                    show: randomShow,
                    open: true,
                    play: true,
                  });
                }}>
                <Icons.info aria-hidden="true" className="h-3 w-3" />
                More Info
              </Button>
            </div>
          </div>
        </div>

        {/* ── Hot right now: 2×2 grid ── */}
        {sideShows.length > 0 && (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:grid-rows-4">
            {sideShows.map((show) => (
              <HotShowCard key={show.id} show={show} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ── Small "hot now" card for the hero sidebar ────────────────────
const HotShowCard = ({ show }: { show: Show }) => {
  const imageOnErrorHandler = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    event.currentTarget.src = '/images/grey-thumbnail.jpg';
  };

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl"
      style={{ aspectRatio: '2/3' }}
      onClick={() => {
        const name = getNameFromShow(show);
        const path = show.media_type === MediaType.TV ? 'tv-shows' : 'movies';
        window.history.pushState(null, '', `${path}/${getSlug(show.id, name)}`);
        useModalStore.setState({ show, open: true, play: true });
      }}>
      <CustomImage
        src={
          show.poster_path ?? show.backdrop_path
            ? `https://image.tmdb.org/t/p/w300${
                show.poster_path ?? show.backdrop_path
              }`
            : '/images/grey-thumbnail.jpg'
        }
        alt={getNameFromShow(show) ?? 'poster'}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        fill
        sizes="200px"
        onError={imageOnErrorHandler}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute bottom-0 left-0 right-0 translate-y-1 p-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <p className="line-clamp-2 text-[10px] font-semibold text-white">
          {getNameFromShow(show)}
        </p>
      </div>
      {show.vote_average > 0 && (
        <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold text-yellow-400 backdrop-blur-sm">
          <Icons.star
            fill="currentColor"
            aria-hidden="true"
            className="h-2 w-2"
          />
          {show.vote_average.toFixed(1)}
        </div>
      )}
    </div>
  );
};

export default Hero;
