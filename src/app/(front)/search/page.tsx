import SearchContainer from '@/components/search-container';
import MovieService from '@/services/MovieService';
import AIService from '@/services/AIService';
import { redirect } from 'next/navigation';
import { MediaType } from '@/types';

interface SearchProps {
  searchParams: {
    q?: string;
  };
}

export const revalidate = 3600;

export default async function SearchPage({ searchParams }: SearchProps) {
  const query = searchParams?.q?.trim() ?? '';
  if (!query.length) {
    redirect('/');
  }

  const [enhancedQuery, intent] = await Promise.all([
    AIService.enhanceSearchQuery(query),
    AIService.analyzeSearchIntent(query),
  ]);

  // Perform the search with the enhanced query
  const shows = await MovieService.searchMovies(enhancedQuery);
  if (intent.intent !== 'both') {
    shows.results = shows.results.filter((item) =>
      intent.intent === 'movie'
        ? item.media_type === MediaType.MOVIE
        : item.media_type === MediaType.TV,
    );
  }

  // Pass original query to UI for display, but results are from enhanced query
  return <SearchContainer query={query} shows={shows.results} />;
}
