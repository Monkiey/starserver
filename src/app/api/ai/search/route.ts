import { NextResponse } from 'next/server';
import StarSearchService from '@/services/StarSearchService';
import MovieService from '@/services/MovieService';
import { MediaType } from '@/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query: string };
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Use AI to enhance the search query and analyze natural language intent
    const [enhancedQuery, intent] = await Promise.all([
      StarSearchService.enhanceSearchQuery(query),
      StarSearchService.analyzeSearchIntent(query),
    ]);

    // Perform the search with the enhanced query
    const searchResults = await MovieService.searchMovies(enhancedQuery);
    if (intent.intent !== 'both') {
      searchResults.results = searchResults.results.filter((item) =>
        intent.intent === 'movie'
          ? item.media_type === MediaType.MOVIE
          : item.media_type === MediaType.TV,
      );
    }

    return NextResponse.json({
      originalQuery: query,
      enhancedQuery,
      intent,
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
