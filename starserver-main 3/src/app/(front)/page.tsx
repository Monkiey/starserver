import Hero from '@/components/hero';
import ContinueWatching from '@/components/continue-watching';
import ShowsContainer from '@/components/shows-container';
import { siteConfig } from '@/configs/site';
import { RequestType, type ShowRequest } from '@/enums/request-type';
import { getRandomShow } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { MediaType, type CategorizedShows, type Show } from '@/types';

export const revalidate = 3600;

export default async function HomePage() {
  const h1 = `${siteConfig.name} Home`;
  const trendingRequests: ShowRequest[] = [
    {
      title: 'Trending Movies',
      req: { requestType: RequestType.TRENDING, mediaType: MediaType.MOVIE },
      visible: true,
    },
    {
      title: 'Trending TV Shows',
      req: { requestType: RequestType.TRENDING, mediaType: MediaType.TV },
      visible: true,
    },
  ];

  const topRatedRequests: ShowRequest[] = [
    {
      title: 'Top Rated TV Shows',
      req: { requestType: RequestType.TOP_RATED, mediaType: MediaType.TV },
      visible: true,
    },
    {
      title: 'Top Rated Movies',
      req: { requestType: RequestType.TOP_RATED, mediaType: MediaType.MOVIE },
      visible: true,
    },
  ];

  const [trendingShows, topRatedShows] = await Promise.all([
    MovieService.getShows(trendingRequests),
    MovieService.getShows(topRatedRequests),
  ]);

  const mergedShows = trendingShows
    .flatMap((category) => category.shows)
    .filter(Boolean)
    .sort((a, b) => b.popularity - a.popularity)
    .reduce((uniqueShows: Show[], show) => {
      const hasShow = uniqueShows.some((item) => item.id === show.id);
      if (!hasShow) {
        uniqueShows.push(show);
      }
      return uniqueShows;
    }, []);

  const shows: CategorizedShows[] = [
    { title: 'Trending TV & Movies', shows: mergedShows, visible: true },
    ...topRatedShows,
  ];

  const randomShow: Show | null = getRandomShow(shows);

  return (
    <>
      <h1 className="hidden">{h1}</h1>
      <Hero randomShow={randomShow} />
      <ContinueWatching />
      <ShowsContainer shows={shows} />
    </>
  );
}
