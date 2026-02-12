import { NextResponse } from 'next/server';
import AIService from '@/services/AIService';
import MovieService from '@/services/MovieService';
import { MediaType } from '@/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query: string };
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Use AI to enhance the search query
    const [enhancedQuery, intent] = await Promise.all([
      AIService.enhanceSearchQuery(query),
      AIService.analyzeSearchIntent(query),
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
