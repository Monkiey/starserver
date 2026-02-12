'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useStarSettingsStore } from '@/stores/star-settings';

export default function SettingsPage() {
  const {
    enableStarRecommendations,
    enableStarPromptSearch,
    enableStarSearch,
    toggleStarRecommendations,
    toggleStarPromptSearch,
    toggleStarSearch,
    resetToDefaults,
  } = useStarSettingsStore();

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your viewing experience and Star AI features
          </p>
        </div>

        {/* Star Features Section */}
        <div className="mb-8 rounded-lg border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <Icons.sparkles className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-semibold">Star AI Features</h2>
          </div>

          <div className="space-y-6">
            {/* Star Recommendations Toggle */}
            <div className="flex items-start justify-between gap-4 border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-medium">Star Recommendations</h3>
                  {enableStarRecommendations && (
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                      Enabled
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Get personalized movie and TV show recommendations based on
                  your watching history using AI-powered analysis.
                </p>
              </div>
              <button
                onClick={toggleStarRecommendations}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  enableStarRecommendations ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label="Toggle Star Recommendations">
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    enableStarRecommendations
                      ? 'translate-x-5'
                      : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Star Prompt Search Toggle */}
            <div className="flex items-start justify-between gap-4 border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-medium">
                    Ask Star (Natural Language Search)
                  </h3>
                  {enableStarPromptSearch && (
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                      Enabled
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Search for content using natural language descriptions like
                  &quot;action movies with car chases&quot; or &quot;funny shows
                  about friends&quot;.
                </p>
              </div>
              <button
                onClick={toggleStarPromptSearch}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  enableStarPromptSearch ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label="Toggle Star Prompt Search">
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    enableStarPromptSearch ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Star Search Toggle */}
            <div className="flex items-start justify-between gap-4 border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-medium">Star-Powered Search</h3>
                  {enableStarSearch && (
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                      Enabled
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Enhance search queries with AI to find better matches. Toggle
                  the Star button in the navigation search to use this feature.
                </p>
              </div>
              <button
                onClick={toggleStarSearch}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  enableStarSearch ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label="Toggle Star Search">
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    enableStarSearch ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-6 border-t pt-6">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="gap-2">
              <Icons.refresh className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
          <div className="flex gap-3">
            <Icons.info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="mb-1 font-medium text-blue-900 dark:text-blue-100">
                About Star AI Features
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Star features use advanced AI to enhance your browsing
                experience. All settings are saved locally in your browser. You
                can disable any Star features at any time without affecting the
                core functionality of the site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
