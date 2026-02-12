import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { env } from '@/env.mjs';
import type { Show } from '@/types';

class AIService {
  private static client: GoogleGenerativeAI | null = null;
  private static model: GenerativeModel | null = null;

  private static getModel(): GenerativeModel | null {
    if (!env.GEMINI_API_KEY) {
      console.warn('Gemini API key not configured');
      return null;
    }

    if (!this.client) {
      this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }

    if (!this.model) {
      this.model = this.client.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });
    }

    return this.model;
  }

  static async enhanceSearchQuery(query: string): Promise<string> {
    const model = this.getModel();
    if (!model) {
      return query;
    }

    try {
      const completion = await model.generateContent({
        systemInstruction: {
          role: 'system',
          parts: [
            {
              text: 'You are a movie and TV show search assistant. Given a user query, extract the main movie or TV show name they are looking for. Return ONLY the title, nothing else. If the query is already clear, return it as is.',
            },
          ],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: query }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.3,
        },
      });

      const enhancedQuery = completion.response.text().trim();
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
    const model = this.getModel();
    if (!model || shows.length === 0) {
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

      const completion = await model.generateContent({
        systemInstruction: {
          role: 'system',
          parts: [
            {
              text: `You are a movie and TV show recommendation expert. Given a list of shows, select the top 5 most interesting ones and provide brief, engaging reasons why users should watch them. ${
                userPreferences ? `User preferences: ${userPreferences}` : ''
              }
Return your response as a JSON object with:
- "suggestions": array of {showId: number, reason: string}
- "summary": a brief one-sentence summary of the recommendations`,
            },
          ],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: JSON.stringify(showsData) }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      });

      const response = completion.response.text();
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
    const model = this.getModel();
    if (!model) {
      return {
        intent: 'both',
        keywords: query.split(' '),
      };
    }

    try {
      const completion = await model.generateContent({
        systemInstruction: {
          role: 'system',
          parts: [
            {
              text: `You are a search intent analyzer for movies and TV shows. Analyze the user's query and determine:
1. Whether they're looking for movies, TV shows, or both
2. What genre they might be interested in (if clear from the query)
3. Key search terms to use

Return a JSON object with: {"intent": "movie"|"tv"|"both", "genre": string|null, "keywords": string[]}`,
            },
          ],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: query }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      });

      const response = completion.response.text();
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
    const model = this.getModel();
    if (!model || shows.length === 0) {
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

      const completion = await model.generateContent({
        systemInstruction: {
          role: 'system',
          parts: [
            {
              text: `You are a movie and TV show search assistant. Given a user's natural language description, find up to 10 matching shows from the provided list.
Analyze the user's intent, genre preferences, themes, and mood they're looking for.
Return your response as a JSON object with:
- "matches": array of {showId: number} for shows that best match the description
- "explanation": a brief explanation of why these shows match the user's request`,
            },
          ],
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `User wants: "${prompt}"\n\nAvailable shows:\n${JSON.stringify(
                  showsData,
                )}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.5,
          responseMimeType: 'application/json',
        },
      });

      const response = completion.response.text();
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
