'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import type { Show } from '@/types';
import ShowsCarousel from '@/components/shows-carousel';

interface AISuggestionsProps {
  shows: Show[];
}

interface AISuggestion {
  showId: number;
  reason: string;
}

interface AISuggestionsResponse {
  suggestions: AISuggestion[];
  summary: string;
}

export default function AISuggestions({ shows }: AISuggestionsProps) {
  const [suggestions, setSuggestions] =
    React.useState<AISuggestionsResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadSuggestions = React.useCallback(async () => {
    if (shows.length === 0) return;

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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load AI suggestions');
      }

      const data = (await response.json()) as AISuggestionsResponse;
      setSuggestions(data);
    } catch (err) {
      console.error('Error loading AI suggestions:', err);
      setError('Failed to load AI-powered suggestions');
    } finally {
      setLoading(false);
    }
  }, [shows]);

  const suggestedShows = React.useMemo(() => {
    if (!suggestions) return shows.slice(0, 10);

    const suggestedIds = new Set(suggestions.suggestions.map((s) => s.showId));
    return shows.filter((show) => suggestedIds.has(show.id));
  }, [suggestions, shows]);

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

  if (shows.length === 0) {
    return null;
  }

  return (
    <section className="relative mb-8 px-4 md:px-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold md:text-2xl">
            <Icons.sparkles className="mr-2 inline-block h-5 w-5 text-yellow-500" />
            AI-Powered Recommendations
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
              Get Suggestions
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
        <p className="mb-4 text-sm text-muted-foreground">
          {suggestions.summary}
        </p>
      )}

      <ShowsCarousel
        shows={suggestedShows}
        getSuggestionReason={suggestions ? getSuggestionReason : undefined}
      />
    </section>
  );
}
