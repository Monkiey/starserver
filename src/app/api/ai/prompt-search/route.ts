import { NextResponse } from 'next/server';
import AIService from '@/services/AIService';
import MovieService from '@/services/MovieService';
import { RequestType } from '@/enums/request-type';
import { MediaType } from '@/types';
import type { Show, CategorizedShows } from '@/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      prompt: string;
    };
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 },
      );
    }

    // Use AI to analyze the prompt and extract search keywords
    const searchIntent = await AIService.analyzeSearchIntent(prompt);

    // Fallback to original prompt if keywords are empty
    const searchQuery =
      searchIntent.keywords.length > 0
        ? searchIntent.keywords.join(' ')
        : prompt;

    // Search TMDB using the extracted keywords to get relevant shows
    const searchResults = await MovieService.searchMovies(searchQuery);

    // If we didn't get enough results from search, supplement with popular/top-rated shows
    const MIN_SEARCH_RESULTS_THRESHOLD = 20;
    let allShows = searchResults.results;

    if (allShows.length < MIN_SEARCH_RESULTS_THRESHOLD) {
      const diverseShows = await MovieService.getShows([
        {
          title: 'Top Rated Movies',
          req: {
            requestType: RequestType.TOP_RATED,
            mediaType: MediaType.MOVIE,
          },
          visible: true,
        },
        {
          title: 'Top Rated TV',
          req: { requestType: RequestType.TOP_RATED, mediaType: MediaType.TV },
          visible: true,
        },
        {
          title: 'Popular Movies',
          req: { requestType: RequestType.POPULAR, mediaType: MediaType.MOVIE },
          visible: true,
        },
        {
          title: 'Popular TV',
          req: { requestType: RequestType.POPULAR, mediaType: MediaType.TV },
          visible: true,
        },
      ]);

      const supplementalShows = diverseShows.flatMap(
        (category: CategorizedShows) => category.shows,
      );
      // Combine search results with supplemental shows, avoiding duplicates
      const existingIds = new Set(allShows.map((show: Show) => show.id));
      const uniqueSupplemental = supplementalShows.filter(
        (show: Show) => !existingIds.has(show.id),
      );
      allShows = [...allShows, ...uniqueSupplemental];
    }

    // Use AI to find shows matching the user's natural language prompt
    const aiResults = await AIService.searchByPrompt(allShows, prompt);

    // Get the actual show objects that AI recommended
    const matchedIds = new Set(aiResults.matches.map((m) => m.showId));
    const matchedShows = allShows.filter((show: Show) =>
      matchedIds.has(show.id),
    );

    return NextResponse.json({
      shows: matchedShows,
      explanation: aiResults.explanation,
      query: prompt,
    });
  } catch (error: unknown) {
    console.error('Error in prompt search:', error);
    return NextResponse.json(
      { error: 'Failed to search with prompt' },
      { status: 500 },
    );
  }
}
