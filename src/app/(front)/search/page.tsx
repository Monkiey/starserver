import SearchContainer from '@/components/search-container';
import MovieService from '@/services/MovieService';
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

  const shows = await MovieService.searchMovies(query);

  // Pass original query to UI for display, but results are from enhanced query
  return <SearchContainer query={query} shows={shows.results} />;
}
