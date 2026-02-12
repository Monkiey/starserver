import type { Show } from '@/types';
import { Genre } from '@/enums/genre';

class AIService {
  private static readonly STOP_WORDS = new Set([
    'a',
    'an',
    'the',
    'of',
    'for',
    'and',
    'or',
    'to',
    'with',
    'about',
    'on',
    'watch',
    'show',
    'movie',
    'series',
    'tv',
    'please',
    'find',
    'me',
    'something',
    'that',
    'i',
    'want',
    'good',
  ]);

  private static readonly GENRE_KEYWORDS: Record<Genre, string[]> = {
    [Genre.ACTION]: ['action', 'battle', 'fight', 'explosive'],
    [Genre.ADVENTURE]: ['adventure', 'quest', 'journey'],
    [Genre.ANIMATION]: ['animated', 'animation', 'cartoon', 'anime'],
    [Genre.COMEDY]: ['comedy', 'funny', 'humor', 'laugh'],
    [Genre.CRIME]: ['crime', 'detective', 'heist', 'mystery'],
    [Genre.DOCUMENTARY]: ['documentary', 'doc'],
    [Genre.DRAMA]: ['drama', 'dramatic', 'emotional'],
    [Genre.FAMILY]: ['family', 'kids', 'children'],
    [Genre.FANTASY]: ['fantasy', 'magic', 'wizard', 'dragon'],
    [Genre.HORROR]: ['horror', 'scary', 'thriller', 'ghost'],
    [Genre.MUSIC]: ['music', 'musical', 'concert'],
    [Genre.ROMANCE]: ['romance', 'romantic', 'love', 'relationship'],
    [Genre.SCIENCE_FICTION]: ['sci-fi', 'science fiction', 'space', 'future'],
    [Genre.THRILLER]: ['thriller', 'suspense', 'tense'],
  };
  private static readonly MAX_SUMMARY_KEYWORDS = 3; // Keeps summary concise for UI
  private static readonly SUGGESTION_DIVERSITY_MOD = 7;
  private static readonly SUGGESTION_DIVERSITY_WEIGHT = 0.5;
  private static readonly SEARCH_DIVERSITY_MOD = 5;

  private static escapeRegex(text: string): string {
    return text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  private static normalizeText(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ');
  }

  private static tokenize(text: string): string[] {
    return this.normalizeText(text)
      .split(/\s+/)
      .filter((token) => token && !this.STOP_WORDS.has(token));
  }

  private static deriveGenres(keywords: string[]): Set<Genre> {
    const matches = new Set<Genre>();
    keywords.forEach((word) => {
      Object.entries(this.GENRE_KEYWORDS).forEach(([genre, cues]) => {
        const matchCue = cues.some((cue) => {
          const pattern = new RegExp(`\\b${this.escapeRegex(cue)}\\b`, 'i');
          return pattern.test(word);
        });
        if (matchCue) {
          matches.add(Number(genre) as Genre);
        }
      });
    });
    return matches;
  }

  private static genreName(genre: Genre): string {
    switch (genre) {
      case Genre.ACTION:
        return 'Action';
      case Genre.ADVENTURE:
        return 'Adventure';
      case Genre.ANIMATION:
        return 'Animation';
      case Genre.COMEDY:
        return 'Comedy';
      case Genre.CRIME:
        return 'Crime';
      case Genre.DOCUMENTARY:
        return 'Documentary';
      case Genre.DRAMA:
        return 'Drama';
      case Genre.FAMILY:
        return 'Family';
      case Genre.FANTASY:
        return 'Fantasy';
      case Genre.HORROR:
        return 'Horror';
      case Genre.MUSIC:
        return 'Music';
      case Genre.ROMANCE:
        return 'Romance';
      case Genre.SCIENCE_FICTION:
        return 'Sci-Fi';
      case Genre.THRILLER:
        return 'Thriller';
      default:
        return 'Top Pick';
    }
  }

  private static buildReason(
    show: Show,
    keywords: string[],
    genreHints: Set<Genre>,
  ): string {
    const title = `${show.title ?? ''} ${show.name ?? ''}`.toLowerCase();
    const overview = (show.overview ?? '').toLowerCase();
    const matchedKeyword = keywords.find(
      (kw) => title.includes(kw) || overview.includes(kw),
    );
    const matchedGenre = (
      show as Partial<{ genre_ids: number[] }>
    ).genre_ids?.find((id) => genreHints.has(id as Genre));

    const reasons: string[] = [];
    if (matchedKeyword) {
      reasons.push(`Matches your interest in "${matchedKeyword}"`);
    }
    if (matchedGenre) {
      reasons.push(`${this.genreName(matchedGenre as Genre)} favorite`);
    }
    if ((show.vote_average ?? 0) >= 7.5) {
      const rating = (show.vote_average ?? 0).toFixed(1);
      reasons.push(`Rated ${rating}`);
    } else if ((show.popularity ?? 0) > 500) {
      reasons.push('Trending with viewers');
    }

    if (!reasons.length) {
      reasons.push('Popular pick right now');
    }

    return reasons.slice(0, 2).join(' · ');
  }

  private static buildSummaryMessage(
    preferenceKeywords: string[],
    hasRanked: boolean,
  ): string {
    if (!hasRanked) {
      return 'Here are some popular movies and shows for you.';
    }

    if (preferenceKeywords.length) {
      return `Personalized picks tuned to ${preferenceKeywords
        .slice(0, this.MAX_SUMMARY_KEYWORDS)
        .join(', ')}.`;
    }

    return 'Top picks curated locally for you right now.';
  }

  static enhanceSearchQuery(query: string): Promise<string> {
    const trimmed = query.trim();
    if (!trimmed.length) return Promise.resolve(query);

    const quotedMatch = trimmed.match(/"([^"]+)"/);
    if (quotedMatch?.[1]) {
      return Promise.resolve(quotedMatch[1].trim());
    }

    const tokens = this.tokenize(trimmed);
    if (!tokens.length) {
      return Promise.resolve(trimmed);
    }

    const cleaned = tokens.join(' ');
    return Promise.resolve(cleaned.length ? cleaned : trimmed);
  }

  static generatePersonalizedSuggestions(
    shows: Show[],
    userPreferences?: string,
  ): Promise<{
    suggestions: Array<{ showId: number; reason: string }>;
    summary: string;
  }> {
    if (shows.length === 0) {
      return Promise.resolve({
        suggestions: shows.slice(0, 5).map((show) => ({
          showId: show.id,
          reason: 'Popular content',
        })),
        summary: 'Here are some popular movies and shows for you.',
      });
    }

    const preferenceKeywords = this.tokenize(userPreferences ?? '');
    const genreHints = this.deriveGenres(preferenceKeywords);

    const scored = new Map<
      number,
      { score: number; show: Show; reason: string }
    >();

    shows.forEach((show) => {
      const title = `${show.title ?? ''} ${show.name ?? ''}`.toLowerCase();
      const overview = (show.overview ?? '').toLowerCase();
      const genreIds =
        (show as Partial<{ genre_ids: number[] }>).genre_ids ?? [];

      let score =
        (show.vote_average ?? 0) * 10 +
        (show.popularity ?? 0) +
        (show.vote_count ?? 0) * 0.05;

      preferenceKeywords.forEach((keyword) => {
        if (title.includes(keyword)) {
          score += 80;
        } else if (overview.includes(keyword)) {
          score += 40;
        }
      });

      if (genreIds.some((id) => genreHints.has(id as Genre))) {
        score += 50;
      }

      // Stable variety based on id
      score +=
        (show.id % this.SUGGESTION_DIVERSITY_MOD) *
        this.SUGGESTION_DIVERSITY_WEIGHT;

      const reason = this.buildReason(show, preferenceKeywords, genreHints);
      const existing = scored.get(show.id);
      if (!existing || existing.score < score) {
        scored.set(show.id, { score, show, reason });
      }
    });

    const ranked = Array.from(scored.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const summary = this.buildSummaryMessage(
      preferenceKeywords,
      ranked.length > 0,
    );

    return Promise.resolve({
      suggestions: ranked.map((entry) => ({
        showId: entry.show.id,
        reason: entry.reason,
      })),
      summary,
    });
  }

  static analyzeSearchIntent(query: string): Promise<{
    intent: 'movie' | 'tv' | 'both';
    genre?: string;
    keywords: string[];
  }> {
    const lower = query.toLowerCase();
    const keywords = this.tokenize(query);
    const genreHints = this.deriveGenres(keywords);

    const isTv =
      lower.includes('season') ||
      lower.includes('episode') ||
      lower.includes('tv') ||
      lower.includes('series');
    const isMovie = lower.includes('movie') || lower.includes('film');

    const intent: 'movie' | 'tv' | 'both' = isTv
      ? isMovie
        ? 'both'
        : 'tv'
      : isMovie
      ? 'movie'
      : 'both';

    const genre =
      genreHints.size > 0
        ? this.genreName(Array.from(genreHints)[0])
        : undefined;

    return Promise.resolve({
      intent,
      genre,
      keywords: keywords.length ? keywords : query.split(' '),
    });
  }

  static searchByPrompt(
    shows: Show[],
    prompt: string,
  ): Promise<{
    matches: Array<{ showId: number }>;
    explanation: string;
  }> {
    if (shows.length === 0) {
      return Promise.resolve({
        matches: shows.slice(0, 10).map((show) => ({ showId: show.id })),
        explanation: 'Here are some popular shows that might interest you.',
      });
    }

    const keywords = this.tokenize(prompt);
    const genreHints = this.deriveGenres(keywords);

    const VOTE_WEIGHT = 5;
    const POPULARITY_WEIGHT = 0.4;

    const scored = shows.map((show) => {
      const title = `${show.title ?? ''} ${show.name ?? ''}`.toLowerCase();
      const overview = (show.overview ?? '').toLowerCase();
      const genreIds =
        (show as Partial<{ genre_ids: number[] }>).genre_ids ?? [];

      let score =
        (show.vote_average ?? 0) * VOTE_WEIGHT +
        (show.popularity ?? 0) * POPULARITY_WEIGHT +
        (show.id % this.SEARCH_DIVERSITY_MOD);

      keywords.forEach((keyword) => {
        if (title.includes(keyword)) {
          score += 60;
        } else if (overview.includes(keyword)) {
          score += 30;
        }
      });

      if (genreIds.some((id) => genreHints.has(id as Genre))) {
        score += 25;
      }

      return { showId: show.id, score };
    });

    const matches = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry) => ({ showId: entry.showId }));

    const explanation =
      keywords.length > 0
        ? `Matched shows to themes like ${keywords.slice(0, 4).join(', ')}.`
        : 'Showing a curated mix of popular titles.';

    return Promise.resolve({
      matches,
      explanation,
    });
  }
}

export default AIService;
