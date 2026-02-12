import { NextResponse } from 'next/server';
import AIService from '@/services/AIService';
import MovieService from '@/services/MovieService';
import { RequestType } from '@/enums/request-type';
import { MediaType } from '@/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userPreferences?: string };
    const { userPreferences } = body;

    // Get trending shows to analyze
    const trendingShows = await MovieService.getShows([
      {
        title: 'Trending',
        req: { requestType: RequestType.TRENDING, mediaType: MediaType.ALL },
        visible: true,
      },
    ]);

    const shows = trendingShows[0]?.shows || [];

    // Use AI to generate personalized suggestions
    const suggestions = await AIService.generatePersonalizedSuggestions(
      shows,
      userPreferences ?? undefined,
    );

    return NextResponse.json({
      suggestions: suggestions.suggestions,
      summary: suggestions.summary,
      totalShows: shows.length,
    });
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 },
    );
  }
}
