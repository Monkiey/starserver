import OpenAI from 'openai';
import { env } from '@/env.mjs';
import type { Show } from '@/types';

class AIService {
  private static openai: OpenAI | null = null;

  private static getClient(): OpenAI | null {
    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.startsWith('sk-your-')) {
      console.warn('OpenAI API key not configured or using placeholder value');
      return null;
    }

    if (!this.openai) {
      this.openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });
    }

    return this.openai;
  }

  static async enhanceSearchQuery(query: string): Promise<string> {
    const client = this.getClient();
    if (!client) {
      return query;
    }

    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a movie and TV show search assistant. Given a user query, extract the main movie or TV show name they are looking for. Return ONLY the title, nothing else. If the query is already clear, return it as is.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: 50,
        temperature: 0.3,
      });

      const enhancedQuery = completion.choices[0]?.message?.content?.trim();
      return enhancedQuery ?? query;
    } catch (error) {
      console.error('Error enhancing search query with AI:', error);
      return query;
    }
  }

  static async generatePersonalizedSuggestions(
    shows: Show[],
    userPreferences?: string,
  ): Promise<{
    suggestions: Array<{ showId: number; reason: string }>;
    summary: string;
  }> {
    const client = this.getClient();
    if (!client || shows.length === 0) {
      return {
        suggestions: shows.slice(0, 5).map((show) => ({
          showId: show.id,
          reason: 'Popular content',
        })),
        summary: 'Here are some popular movies and shows for you.',
      };
    }

    try {
      const showsData = shows.slice(0, 20).map((show) => ({
        id: show.id,
        title: show.title ?? show.name,
        overview: show.overview?.substring(0, 150),
        rating: show.vote_average,
        popularity: show.popularity,
      }));

      const completion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a movie and TV show recommendation expert. Given a list of shows, select the top 5 most interesting ones and provide brief, engaging reasons why users should watch them. ${
              userPreferences ? `User preferences: ${userPreferences}` : ''
            }
Return your response as a JSON object with:
- "suggestions": array of {showId: number, reason: string}
- "summary": a brief one-sentence summary of the recommendations`,
          },
          {
            role: 'user',
            content: JSON.stringify(showsData),
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const parsed = JSON.parse(response) as {
          suggestions: Array<{ showId: number; reason: string }>;
          summary: string;
        };
        return parsed;
      }

      return {
        suggestions: shows.slice(0, 5).map((show) => ({
          showId: show.id,
          reason: 'Highly recommended',
        })),
        summary: 'Here are some great picks for you.',
      };
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      return {
        suggestions: shows.slice(0, 5).map((show) => ({
          showId: show.id,
          reason: 'Popular content',
        })),
        summary: 'Here are some popular movies and shows for you.',
      };
    }
  }

  static async analyzeSearchIntent(query: string): Promise<{
    intent: 'movie' | 'tv' | 'both';
    genre?: string;
    keywords: string[];
  }> {
    const client = this.getClient();
    if (!client) {
      return {
        intent: 'both',
        keywords: query.split(' '),
      };
    }

    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a search intent analyzer for movies and TV shows. Analyze the user's query and determine:
1. Whether they're looking for movies, TV shows, or both
2. What genre they might be interested in (if clear from the query)
3. Key search terms to use

Return a JSON object with: {"intent": "movie"|"tv"|"both", "genre": string|null, "keywords": string[]}`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const parsed = JSON.parse(response) as {
          intent: 'movie' | 'tv' | 'both';
          genre?: string | null;
          keywords: string[];
        };
        return {
          intent: parsed.intent ?? 'both',
          genre: parsed.genre ?? undefined,
          keywords: parsed.keywords ?? query.split(' '),
        };
      }

      return {
        intent: 'both',
        keywords: query.split(' '),
      };
    } catch (error) {
      console.error('Error analyzing search intent:', error);
      return {
        intent: 'both',
        keywords: query.split(' '),
      };
    }
  }

  static async searchByPrompt(
    shows: Show[],
    prompt: string,
  ): Promise<{
    matches: Array<{ showId: number }>;
    explanation: string;
  }> {
    const client = this.getClient();
    if (!client || shows.length === 0) {
      return {
        matches: shows.slice(0, 10).map((show) => ({ showId: show.id })),
        explanation: 'Here are some popular shows that might interest you.',
      };
    }

    try {
      const showsData = shows.slice(0, 50).map((show) => ({
        id: show.id,
        title: show.title ?? show.name,
        overview: show.overview?.substring(0, 200),
        genres: show.genre_ids as number[] | undefined,
        rating: show.vote_average,
        type: show.media_type,
      }));

      const completion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a movie and TV show search assistant. Given a user's natural language description, find up to 10 matching shows from the provided list.
Analyze the user's intent, genre preferences, themes, and mood they're looking for.
Return your response as a JSON object with:
- "matches": array of {showId: number} for shows that best match the description
- "explanation": a brief explanation of why these shows match the user's request`,
          },
          {
            role: 'user',
            content: `User wants: "${prompt}"\n\nAvailable shows:\n${JSON.stringify(
              showsData,
            )}`,
          },
        ],
        max_tokens: 800,
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const parsed = JSON.parse(response) as {
          matches: Array<{ showId: number }>;
          explanation: string;
        };
        return parsed;
      }

      return {
        matches: shows.slice(0, 10).map((show) => ({ showId: show.id })),
        explanation: 'Here are some shows that might match your description.',
      };
    } catch (error) {
      console.error('Error searching by prompt:', error);
      return {
        matches: shows.slice(0, 10).map((show) => ({ showId: show.id })),
        explanation: 'Here are some popular shows that might interest you.',
      };
    }
  }
}

export default AIService;
