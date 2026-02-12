import { NextResponse } from 'next/server';
import AIService from '@/services/AIService';
import MovieService from '@/services/MovieService';
import { RequestType } from '@/enums/request-type';
import { MediaType, type Show } from '@/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userPreferences?: string;
      continueWatching?: Show[];
      refreshCount?: number;
    };
    const { userPreferences, continueWatching, refreshCount = 0 } = body;

    // Get diverse shows from multiple categories for AI to analyze
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

    // Combine shows from all categories for diverse selection
    const allShows = diverseShows.flatMap((category) => category.shows);

    // Shuffle shows to provide variety on refresh
    const shuffledShows = [...allShows].sort(() => Math.random() - 0.5);

    // Build user context from continue watching history
    let userContext = userPreferences;
    if (continueWatching && continueWatching.length > 0) {
      const watchedTitles = continueWatching
        .map((show) => show.title ?? show.name)
        .filter(Boolean)
        .join(', ');
      userContext = `User has been watching: ${watchedTitles}. ${
        userPreferences ?? ''
      }`;
    }

    // Add refresh context to get different results
    if (refreshCount > 0) {
      userContext = `${
        userContext ? userContext + ' ' : ''
      }This is refresh #${refreshCount}. Please provide DIFFERENT recommendations than previous suggestions.`;
    }

    // Use AI to generate personalized suggestions from diverse content
    const suggestions = await AIService.generatePersonalizedSuggestions(
      shuffledShows,
      userContext,
    );

    // Get the actual show objects that AI recommended
    const suggestedIds = new Set(suggestions.suggestions.map((s) => s.showId));
    const recommendedShows = shuffledShows.filter((show) =>
      suggestedIds.has(show.id),
    );

    return NextResponse.json({
      suggestions: suggestions.suggestions,
      summary: suggestions.summary,
      shows: recommendedShows,
      totalShows: allShows.length,
    });
  } catch (error: unknown) {
    console.error('Error generating Star suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 },
    );
  }
}
