import { NextResponse } from 'next/server';
import AIService from '@/services/AIService';
import MovieService from '@/services/MovieService';
import { RequestType } from '@/enums/request-type';
import { MediaType } from '@/types';

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

    // Get diverse shows from multiple categories to search through
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

    // Combine shows from all categories
    const allShows = diverseShows.flatMap((category) => category.shows);

    // Use AI to find shows matching the user's natural language prompt
    const searchResults = await AIService.searchByPrompt(allShows, prompt);

    // Get the actual show objects that AI recommended
    const matchedIds = new Set(searchResults.matches.map((m) => m.showId));
    const matchedShows = allShows.filter((show) => matchedIds.has(show.id));

    return NextResponse.json({
      shows: matchedShows,
      explanation: searchResults.explanation,
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
