import SearchContainer from '@/components/search-container';
import MovieService from '@/services/MovieService';
import AIService from '@/services/AIService';
import { redirect } from 'next/navigation';

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

  // Use AI to enhance the search query
  const enhancedQuery = await AIService.enhanceSearchQuery(query);

  // Perform the search with the enhanced query
  const shows = await MovieService.searchMovies(enhancedQuery);
  return <SearchContainer query={query} shows={shows.results} />;
}
