import { NextResponse } from 'next/server';
import AIService from '@/services/AIService';
import MovieService from '@/services/MovieService';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query: string };
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Use AI to enhance the search query
    const enhancedQuery = await AIService.enhanceSearchQuery(query);

    // Perform the search with the enhanced query
    const searchResults = await MovieService.searchMovies(enhancedQuery);

    return NextResponse.json({
      originalQuery: query,
      enhancedQuery,
      results: searchResults.results,
      totalResults: searchResults.totalResults ?? 0,
    });
  } catch (error: unknown) {
    console.error('Error in AI search:', error);
    return NextResponse.json(
      { error: 'Failed to perform AI search' },
      { status: 500 },
    );
  }
}
