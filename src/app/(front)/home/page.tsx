const FALLBACK_RECOMMENDATIONS_COUNT = 12; // Fills a 3x4 carousel when personalized picks are unavailable

import ContinueWatching from '@/components/continue-watching';
import Hero from '@/components/hero';
import ShowsContainer from '@/components/shows-container';
import { MediaType, type CategorizedShows, type Show } from '@/types';
import { siteConfig } from '@/configs/site';
import { RequestType, type ShowRequest } from '@/enums/request-type';
import MovieService from '@/services/MovieService';
import { Genre } from '@/enums/genre';
import { getRandomShow } from '@/lib/utils';
import AIService from '@/services/AIService';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const h1 = `${siteConfig.name} Home`;
  const requests: ShowRequest[] = [
    {
      title: 'Trending Now',
      req: { requestType: RequestType.TRENDING, mediaType: MediaType.ALL },
      visible: true,
    },
    {
      title: 'Netflix TV Shows',
      req: { requestType: RequestType.NETFLIX, mediaType: MediaType.TV },
      visible: true,
    },
    {
      title: 'Popular TV Shows',
      req: {
        requestType: RequestType.TOP_RATED,
        mediaType: MediaType.TV,
        genre: Genre.TV_MOVIE,
      },
      visible: true,
    },
    {
      title: 'Comedy Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.COMEDY,
      },
      visible: true,
    },
    {
      title: 'Action Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.ACTION,
      },
      visible: true,
    },
    {
      title: 'Sci-Fi Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.SCIENCE_FICTION,
      },
      visible: true,
    },
    {
      title: 'Animation Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.ANIMATION,
      },
      visible: true,
    },
    {
      title: 'Crime Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.CRIME,
      },
      visible: true,
    },
    {
      title: 'Documentary Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.DOCUMENTARY,
      },
      visible: true,
    },
    {
      title: 'Romance Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.ROMANCE,
      },
      visible: true,
    },
    {
      title: 'Scary Movies',
      req: {
        requestType: RequestType.GENRE,
        mediaType: MediaType.MOVIE,
        genre: Genre.THRILLER,
      },
      visible: true,
    },
  ];
  const allShows = await MovieService.getShows(requests);
  const allAvailableShows = allShows.flatMap(
    (category) => category.shows ?? [],
  );

  const starSuggestions =
    await AIService.generatePersonalizedSuggestions(allAvailableShows);
  const suggestionReasons: Record<number, string> = Object.fromEntries(
    starSuggestions.suggestions.map((entry) => [entry.showId, entry.reason]),
  );

  const showById = new Map(allAvailableShows.map((show) => [show.id, show]));
  const recommendedShows = starSuggestions.suggestions
    .map((suggestion) => showById.get(suggestion.showId))
    .filter(Boolean) as Show[];

  const prioritizedShows: CategorizedShows[] = allShows.map((category) => ({
    ...category,
    shows: [...(category.shows ?? [])].sort((a, b) => {
      const aStar = suggestionReasons[a.id] ? 1 : 0;
      const bStar = suggestionReasons[b.id] ? 1 : 0;
      if (aStar !== bStar) return bStar - aStar;
      return (b.vote_average ?? 0) - (a.vote_average ?? 0);
    }),
  }));

  const curatedShows: CategorizedShows[] = [
    {
      title: 'For You',
      shows:
        recommendedShows.length > 0
          ? recommendedShows
          : allAvailableShows.slice(0, FALLBACK_RECOMMENDATIONS_COUNT),
      visible: true,
    },
    ...prioritizedShows,
  ];

  const heroShow: Show | null =
    recommendedShows[0] ?? getRandomShow(curatedShows);

  return (
    <>
      <h1 className="hidden">{h1}</h1>
      <Hero randomShow={heroShow} />
      <ContinueWatching />
      <ShowsContainer
        shows={curatedShows}
        starSuggestionReasons={suggestionReasons}
      />
    </>
  );
}
