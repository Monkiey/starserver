import React from 'react';
import {
  VodiHeader,
  VodiHero,
  VodiSection,
  VodiFeaturedGrid,
  VodiFooter,
} from '@/components/vodi';
import { MediaType, type Show } from '@/types';
import { RequestType, type ShowRequest } from '@/enums/request-type';
import { Genre } from '@/enums/genre';
import MovieService from '@/services/MovieService';
import { getRandomShow } from '@/lib/utils';
import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Vodi Template – ${siteConfig.name}`,
  description:
    'A cinematic movie & TV show browsing experience inspired by the Vodi video theme.',
};

export default async function VodiPage() {
  const requests: ShowRequest[] = [
    {
      title: 'Trending Now',
      req: { requestType: RequestType.TRENDING, mediaType: MediaType.ALL },
      visible: true,
    },
    {
      title: 'Top Rated Movies',
      req: { requestType: RequestType.TOP_RATED, mediaType: MediaType.MOVIE },
      visible: true,
    },
    {
      title: 'Popular TV Shows',
      req: { requestType: RequestType.POPULAR, mediaType: MediaType.TV },
      visible: true,
    },
    {
      title: 'Action & Adventure',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.ACTION,
      },
      visible: true,
    },
    {
      title: 'Comedy',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.COMEDY,
      },
      visible: true,
    },
    {
      title: 'Sci-Fi',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.SCIENCE_FICTION,
      },
      visible: true,
    },
    {
      title: 'Drama',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.DRAMA,
      },
      visible: true,
    },
    {
      title: 'Horror',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.HORROR,
      },
      visible: true,
    },
    {
      title: 'Netflix Originals',
      req: { requestType: RequestType.NETFLIX, mediaType: MediaType.TV },
      visible: true,
    },
  ];

  const allShows = await MovieService.getShows(requests);
  const heroShow: Show | null = getRandomShow(allShows);

  // Extract individual category arrays by title
  const getShows = (title: string): Show[] =>
    allShows.find((s) => s.title === title)?.shows ?? [];

  const trending = getShows('Trending Now');
  const topRated = getShows('Top Rated Movies');
  const popularTV = getShows('Popular TV Shows');
  const action = getShows('Action & Adventure');
  const comedy = getShows('Comedy');
  const scifi = getShows('Sci-Fi');
  const drama = getShows('Drama');
  const horror = getShows('Horror');
  const netflix = getShows('Netflix Originals');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <VodiHeader />

      {/* Hero */}
      <VodiHero show={heroShow} />

      {/* Content sections */}
      <div className="space-y-12 py-12">
        {/* Trending – ranked */}
        <VodiSection
          id="trending"
          title="Trending Now"
          shows={trending}
          seeAllHref="/movies"
          ranked
        />

        {/* Featured grid – top rated */}
        <VodiFeaturedGrid
          id="top-rated"
          title="Top Rated Movies"
          shows={topRated}
        />

        <VodiSection
          title="Popular TV Shows"
          shows={popularTV}
          seeAllHref="/tv-shows"
        />

        <VodiSection
          title="Action & Adventure"
          shows={action}
          seeAllHref="/movies"
        />

        <VodiSection title="Comedy" shows={comedy} seeAllHref="/movies" />

        {/* Netflix originals – ranked */}
        <VodiSection
          title="Netflix Originals"
          shows={netflix}
          seeAllHref="/tv-shows"
          ranked
        />

        <VodiSection title="Sci-Fi" shows={scifi} seeAllHref="/movies" />

        <VodiSection title="Drama" shows={drama} seeAllHref="/movies" />

        <VodiSection title="Horror" shows={horror} seeAllHref="/movies" />
      </div>

      <VodiFooter />
    </div>
  );
}
