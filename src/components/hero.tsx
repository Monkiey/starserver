'use client';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { getIdFromSlug } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { useModalStore } from '@/stores/modal';
import { useSearchStore } from '@/stores/search';
import { MediaType, type Show } from '@/types';
import { type AxiosResponse } from 'axios';
import Link from 'next/link';
import React from 'react';
import CustomImage from './custom-image';

interface HeroProps {
  randomShow: Show | null;
}

const Hero = ({ randomShow }: HeroProps) => {
  const modalStore = useModalStore();
  const searchStore = useSearchStore();

  const handlePopstateEvent = React.useCallback(() => {
    const pathname = window.location.pathname;
    if (!/\d/.test(pathname)) {
      modalStore.reset();
      return;
    }

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

  const handleHref = (): string => {
    if (!randomShow) {
      return '#';
    }
    const type = randomShow.media_type === MediaType.MOVIE ? 'movie' : 'tv';
    return `/watch/${type}/${randomShow.id}`;
  };

  const airDate = randomShow?.release_date ?? randomShow?.first_air_date;

  return (
    <section
      aria-label="Hero"
      className="relative isolate -mt-16 flex min-h-screen items-end overflow-hidden px-[4%] pb-10 pt-28 sm:-mt-20 sm:pt-32 md:pt-36">
      {randomShow && (
        <>
          <div className="absolute inset-0 -z-20">
            <CustomImage
              src={`https://image.tmdb.org/t/p/original${
                randomShow?.backdrop_path ?? randomShow?.poster_path ?? ''
              }`}
              alt={randomShow?.title ?? randomShow?.name ?? 'poster'}
              className="-z-40 h-auto w-full object-cover opacity-80"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              fill
              priority
            />
            <div className="bg-black/35 absolute inset-x-[-22%] top-[-240px] h-[520px] blur-3xl" />
            <div className="absolute inset-0 bg-black/25" />
          </div>
          <div className="dark:border-white/15 border-white/15 relative mx-auto flex w-full max-w-6xl flex-col gap-6 overflow-hidden rounded-[32px] border bg-black/60 p-6 text-white shadow-[0_30px_120px_-70px_rgba(0,0,0,0.9)] backdrop-blur-3xl transition sm:p-10">
            <div
              className="bg-white/8 pointer-events-none absolute inset-0"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-black/50"
              aria-hidden="true"
            />
            <div className="relative z-10">
              <div className="grid gap-6 lg:items-center">
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/60">
                    Featured
                  </p>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                      {randomShow?.title ?? randomShow?.name}
                    </h1>
                    <p className="max-w-2xl text-base text-white/80 sm:text-lg">
                      {randomShow?.overview ??
                        'Lean back, press play, and let the glassy stage frame your next watch.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link prefetch={false} href={handleHref()}>
                      <Button
                        aria-label="Play video"
                        className="h-auto gap-2 rounded-2xl bg-white text-black shadow-[0_20px_70px_-45px_rgba(0,0,0,0.65)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_90px_-50px_rgba(0,0,0,0.65)]">
                        <Icons.play
                          className="fill-current"
                          aria-hidden="true"
                        />
                        Play
                      </Button>
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                    <span className="bg-white/12 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 shadow-sm backdrop-blur">
                      <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_0_6px_rgba(74,222,128,0.25)]" />
                      {`${Math.round(
                        (randomShow?.vote_average ?? 0) * 10,
                      )}% Match`}
                    </span>
                    {airDate && (
                      <span className="bg-white/12 rounded-full border border-white/20 px-3 py-1 shadow-sm backdrop-blur">
                        {airDate}
                      </span>
                    )}
                    <span className="bg-white/12 rounded-full border border-white/20 px-3 py-1 shadow-sm backdrop-blur">
                      {randomShow?.media_type === MediaType.TV
                        ? 'Series'
                        : 'Film'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Hero;
