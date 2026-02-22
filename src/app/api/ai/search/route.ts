import { NextResponse } from 'next/server';
import StarSearchService from '@/services/StarSearchService';
import MovieService from '@/services/MovieService';
import { MediaType } from '@/types';
import { Genre } from '@/enums/genre';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
      mode?: 'title' | 'genre';
      genreId?: number;
    };
    const { query, mode = 'title', genreId } = body;

    // ── Genre browse mode ──────────────────────────────────────────────────
    // Discover titles in the selected genre for both movies and TV shows.
    if (mode === 'genre') {
      if (
        typeof genreId !== 'number' ||
        !Object.values(Genre).includes(genreId as Genre)
      ) {
        return NextResponse.json(
          { error: 'A valid genreId is required for genre mode' },
          { status: 400 },
        );
      }

      const [movieResponse, tvResponse] = await Promise.allSettled([
        MovieService.searchByGenre(genreId as Genre, MediaType.MOVIE),
        MovieService.searchByGenre(genreId as Genre, MediaType.TV),
      ]);

      const results = [
        ...(movieResponse.status === 'fulfilled'
          ? movieResponse.value.results
          : []),
        ...(tvResponse.status === 'fulfilled' ? tvResponse.value.results : []),
      ].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

      const totalResults =
        (movieResponse.status === 'fulfilled'
          ? movieResponse.value.totalResults ?? 0
          : 0) +
        (tvResponse.status === 'fulfilled'
          ? tvResponse.value.totalResults ?? 0
          : 0);

      return NextResponse.json({ results, totalResults });
    }

    // ── Title search mode ──────────────────────────────────────────────────
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const [enhancedQuery, intent] = await Promise.all([
      StarSearchService.enhanceSearchQuery(query),
      StarSearchService.analyzeSearchIntent(query),
    ]);

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
