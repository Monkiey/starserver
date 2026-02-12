'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Show } from '@/types';
import ShowsCarousel from '@/components/shows-carousel';
import { useStarSettingsStore } from '@/stores/star-settings';

interface PromptSearchResult {
  shows: Show[];
  explanation: string;
  query: string;
}

export default function StarPromptSearch() {
  const [prompt, setPrompt] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<PromptSearchResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { enableStarPromptSearch } = useStarSettingsStore();

  const handleSearch = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const searchQuery = prompt.trim();
      if (!searchQuery) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/prompt-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: searchQuery,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to search with prompt');
        }

        const data = (await response.json()) as PromptSearchResult;
        setResult(data);
      } catch (err) {
        console.error('Error searching with prompt:', err);
        setError('Failed to find content matching your description');
      } finally {
        setLoading(false);
      }
    },
    [prompt],
  );

  const handleClear = () => {
    setPrompt('');
    setResult(null);
    setError(null);
    inputRef.current?.focus();
  };

  // Don't render if Star Prompt Search is disabled
  if (!enableStarPromptSearch) {
    return null;
  }

  return (
    <section className="relative mb-8 px-4 md:px-8">
      <div className="mb-4">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-semibold md:text-2xl">
            <Icons.sparkles className="mr-2 inline-block h-5 w-5 text-blue-500" />
            Ask Star
          </h2>
        </div>

        <form onSubmit={(e) => void handleSearch(e)} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Describe what you want to watch... (e.g., 'a thrilling sci-fi movie with time travel')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                className="pr-10"
              />
              {prompt && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear">
                  <Icons.close className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" disabled={loading || !prompt.trim()}>
              {loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Icons.search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {result && result.shows.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="mb-1 text-sm font-medium">Results for:</p>
            <p className="text-sm italic text-muted-foreground">
              &quot;{result.query}&quot;
            </p>
            <p className="mt-2 text-sm">{result.explanation}</p>
          </div>
          <ShowsCarousel shows={result.shows} />
        </div>
      )}

      {result && result.shows.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No matches found. Try describing what you&apos;re looking for in a
            different way.
          </p>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <Icons.sparkles className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="mb-2 text-sm text-muted-foreground">
            Describe what you want to watch and let Star find it for you.
          </p>
          <p className="text-xs text-muted-foreground">
            Try: &quot;action movies with car chases&quot;, &quot;comedy shows
            about friends&quot;, or &quot;documentaries about space&quot;
          </p>
        </div>
      )}
    </section>
  );
}
