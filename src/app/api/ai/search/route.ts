import { NextResponse } from 'next/server';
import StarSearchService from '@/services/StarSearchService';
import MovieService from '@/services/MovieService';
import { MediaType, type Show } from '@/types';
import type { Genre } from '@/enums/genre';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query: string };
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Analyze intent and enhance query concurrently
    const [enhancedQuery, intent] = await Promise.all([
      StarSearchService.enhanceSearchQuery(query),
      StarSearchService.analyzeSearchIntent(query),
    ]);

    let results: Show[];
    let totalResults: number;

    if (intent.isGenreSearch && intent.genreIds.length > 0) {
      // Genre search: run the TMDB discover API (movie + TV) AND a title text
      // search in parallel so that both genre-catalogue content and any titles
      // that literally match the query (e.g. "Action Jackson") are returned.
      const primaryGenre = intent.genreIds[0] as Genre;
      const mediaTypes =
        intent.intent === 'tv'
          ? [MediaType.TV]
          : intent.intent === 'movie'
          ? [MediaType.MOVIE]
          : [MediaType.MOVIE, MediaType.TV];

      const [genreResponses, textData] = await Promise.all([
        Promise.allSettled(
          mediaTypes.map((mt) => MovieService.searchByGenre(primaryGenre, mt)),
        ),
        MovieService.searchMovies(enhancedQuery),
      ]);

      // Apply intent filter to text results
      const textShows =
        intent.intent === 'both'
          ? textData.results
          : textData.results.filter((item) =>
              intent.intent === 'movie'
                ? item.media_type === MediaType.MOVIE
                : item.media_type === MediaType.TV,
            );

      const genreShows = genreResponses
        .flatMap((r) => (r.status === 'fulfilled' ? r.value.results : []))
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

      // Merge: title matches first (more specific), then genre-only content —
      // deduplicate by id so nothing appears twice.
      const seen = new Set<number>();
      results = [];
      for (const show of [...textShows, ...genreShows]) {
        if (!seen.has(show.id)) {
          seen.add(show.id);
          results.push(show);
        }
      }

      // Sum TMDB genre totals for the real catalogue size
      totalResults = genreResponses.reduce(
        (sum, r) =>
          sum + (r.status === 'fulfilled' ? r.value.totalResults ?? 0 : 0),
        0,
      );
    } else {
      // Standard title / keyword text search
      const searchResults = await MovieService.searchMovies(enhancedQuery);
      if (intent.intent !== 'both') {
        searchResults.results = searchResults.results.filter((item) =>
          intent.intent === 'movie'
            ? item.media_type === MediaType.MOVIE
            : item.media_type === MediaType.TV,
        );
      }
      results = searchResults.results;
      totalResults = searchResults.totalResults ?? 0;
    }

    return NextResponse.json({
      originalQuery: query,
      enhancedQuery,
      intent,
      results,
      totalResults,
    });
  } catch (error: unknown) {
    console.error('Error in AI search:', error);
    return NextResponse.json(
      { error: 'Failed to perform AI search' },
      { status: 500 },
    );
  }
}
