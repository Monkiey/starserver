'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import type { Show } from '@/types';
import ShowsCarousel from '@/components/shows-carousel';
import { useContinueWatchingStore } from '@/stores/continue-watching';
import { useStarSettingsStore } from '@/stores/star-settings';

interface StarSuggestion {
  showId: number;
  reason: string;
}

interface StarSuggestionsResponse {
  suggestions: StarSuggestion[];
  summary: string;
  shows: Show[];
}

export default function StarSuggestions() {
  const [suggestions, setSuggestions] =
    React.useState<StarSuggestionsResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshCount, setRefreshCount] = React.useState(0);
  const { items: continueWatching } = useContinueWatchingStore();
  const { enableStarRecommendations } = useStarSettingsStore();

  const loadSuggestions = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPreferences: '',
          continueWatching: continueWatching.slice(0, 10), // Send up to 10 recent items
          refreshCount: refreshCount, // Send refresh count to get varied results
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load Star suggestions');
      }

      const data = (await response.json()) as StarSuggestionsResponse;
      setSuggestions(data);
      setRefreshCount((prev) => prev + 1); // Increment for next refresh
    } catch (err) {
      console.error('Error loading Star suggestions:', err);
      setError('Failed to load Star-powered suggestions');
    } finally {
      setLoading(false);
    }
  }, [continueWatching, refreshCount]);

  const getSuggestionReason = React.useCallback(
    (showId: number) => {
      if (!suggestions) return null;
      const suggestion = suggestions.suggestions.find(
        (s) => s.showId === showId,
      );
      return suggestion?.reason;
    },
    [suggestions],
  );

  // Don't render if Star Recommendations are disabled
  if (!enableStarRecommendations) {
    return null;
  }

  return (
    <section className="relative mb-8 px-4 md:px-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold md:text-2xl">
            <Icons.sparkles className="mr-2 inline-block h-5 w-5 text-yellow-500" />
            Star Recommendations
          </h2>
        </div>
        <Button
          onClick={() => void loadSuggestions()}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2">
          {loading ? (
            <>
              <Icons.spinner className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Icons.refresh className="h-4 w-4" />
              Get Recommendations
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {suggestions && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {suggestions.summary}
          </p>
          <ShowsCarousel
            shows={suggestions.shows}
            getSuggestionReason={getSuggestionReason}
          />
        </>
      )}

      {!suggestions && !loading && !error && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <Icons.sparkles className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {continueWatching.length > 0
              ? `Click "Get Recommendations" to receive personalized suggestions based on your watching history.`
              : `Click "Get Recommendations" to discover top-rated and popular content.`}
          </p>
        </div>
      )}
    </section>
  );
}
