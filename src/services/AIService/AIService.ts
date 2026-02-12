import type { Show } from '@/types';
import { Genre } from '@/enums/genre';

export type SearchMood =
  | 'dark'
  | 'light'
  | 'intense'
  | 'cerebral'
  | 'nostalgic'
  | 'uplifting';

export type SearchEra = 'classic' | 'retro' | 'modern' | 'recent';

export type SearchAudience = 'kids' | 'family' | 'date' | 'mature';

export interface NaturalLanguageIntent {
  intent: 'movie' | 'tv' | 'both';
  genre?: string;
  keywords: string[];
  mood?: SearchMood;
  era?: SearchEra;
  audience?: SearchAudience;
}

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
    'can',
    'you',
    'suggest',
    'recommend',
    'looking',
    'need',
    'like',
    'some',
    'any',
    'really',
    'very',
    'just',
    'give',
    'get',
  ]);

  private static readonly GENRE_KEYWORDS: Partial<Record<Genre, string[]>> = {
    [Genre.ACTION]: [
      'action',
      'battle',
      'fight',
      'explosive',
      'adrenaline',
      'combat',
      'martial arts',
      'shootout',
    ],
    [Genre.ADVENTURE]: [
      'adventure',
      'quest',
      'journey',
      'expedition',
      'explore',
      'treasure',
    ],
    [Genre.ANIMATION]: ['animated', 'animation', 'cartoon', 'anime', 'pixar'],
    [Genre.COMEDY]: [
      'comedy',
      'funny',
      'humor',
      'laugh',
      'hilarious',
      'witty',
      'slapstick',
      'sitcom',
      'parody',
      'satire',
    ],
    [Genre.CRIME]: [
      'crime',
      'detective',
      'heist',
      'mystery',
      'police',
      'gangster',
      'mob',
      'noir',
      'whodunit',
    ],
    [Genre.DOCUMENTARY]: [
      'documentary',
      'doc',
      'true story',
      'real life',
      'nonfiction',
      'docuseries',
    ],
    [Genre.DRAMA]: [
      'drama',
      'dramatic',
      'emotional',
      'moving',
      'powerful',
      'heartfelt',
      'poignant',
    ],
    [Genre.FAMILY]: [
      'family',
      'kids',
      'children',
      'wholesome',
      'family-friendly',
    ],
    [Genre.FANTASY]: [
      'fantasy',
      'magic',
      'wizard',
      'dragon',
      'mythical',
      'enchanted',
      'fairy tale',
      'supernatural',
    ],
    [Genre.HISTORY]: ['history', 'historical', 'period', 'ancient', 'biopic'],
    [Genre.HORROR]: [
      'horror',
      'scary',
      'ghost',
      'zombie',
      'slasher',
      'haunted',
      'creepy',
      'terrifying',
    ],
    [Genre.MUSIC]: ['music', 'musical', 'concert', 'band', 'singer'],
    [Genre.MYSTERY]: [
      'mystery',
      'whodunit',
      'enigma',
      'puzzle',
      'clue',
      'investigation',
    ],
    [Genre.ROMANCE]: [
      'romance',
      'romantic',
      'love',
      'relationship',
      'rom-com',
      'love story',
    ],
    [Genre.SCIENCE_FICTION]: [
      'sci-fi',
      'science fiction',
      'space',
      'future',
      'futuristic',
      'alien',
      'robot',
      'dystopia',
      'cyberpunk',
      'time travel',
    ],
    [Genre.TV_MOVIE]: ['tv movie', 'television movie', 'made for tv'],
    [Genre.THRILLER]: [
      'thriller',
      'suspense',
      'tense',
      'gripping',
      'edge of seat',
      'nail-biting',
      'psychological',
    ],
    [Genre.WAR]: ['war', 'military', 'soldier', 'battlefield', 'army'],
    [Genre.WESTERN]: [
      'western',
      'cowboy',
      'frontier',
      'wild west',
      'gunslinger',
    ],
    [Genre.ACTION_ADVENTURE]: ['action adventure'],
    [Genre.KIDS]: ['kids show', 'cartoon', 'preschool'],
    [Genre.NEWS]: ['news', 'journalism', 'current events'],
    [Genre.REALITY]: ['reality', 'reality tv', 'competition', 'game show'],
    [Genre.SCIFI_FANTASY]: ['sci-fi fantasy', 'science fantasy'],
    [Genre.SOAP]: ['soap', 'soap opera', 'daytime'],
    [Genre.TALK]: ['talk show', 'late night', 'interview'],
    [Genre.WAR_POLITICS]: ['political', 'politics', 'government', 'espionage'],
  };

  // Natural language phrase-to-keyword mappings for conversational queries
  private static readonly NL_PHRASE_MAP: Record<string, string[]> = {
    'feel good': ['comedy', 'family', 'uplifting'],
    'feel-good': ['comedy', 'family', 'uplifting'],
    'make me cry': ['drama', 'emotional', 'heartfelt'],
    'mind bending': ['thriller', 'psychological', 'twist'],
    'mind-bending': ['thriller', 'psychological', 'twist'],
    'edge of my seat': ['thriller', 'suspense', 'action'],
    'based on true': ['biography', 'true story', 'inspired'],
    'based on a true story': ['biography', 'true story', 'inspired'],
    'date night': ['romance', 'comedy', 'drama'],
    'girls night': ['comedy', 'romance', 'drama'],
    "girls' night": ['comedy', 'romance', 'drama'],
    'boys night': ['action', 'comedy', 'thriller'],
    "boys' night": ['action', 'comedy', 'thriller'],
    'rainy day': ['drama', 'comedy', 'cozy'],
    'binge worthy': ['series', 'addictive', 'compelling'],
    'binge-worthy': ['series', 'addictive', 'compelling'],
    'guilty pleasure': ['reality', 'comedy', 'drama'],
    'hidden gem': ['underrated', 'indie', 'acclaimed'],
    'blow my mind': ['sci-fi', 'thriller', 'twist'],
    'chill and watch': ['comedy', 'light', 'easy'],
    'background noise': ['comedy', 'sitcom', 'light'],
    'so bad its good': ['comedy', 'campy', 'cult'],
    'turn off brain': ['action', 'comedy', 'popcorn'],
    'before bed': ['drama', 'documentary', 'calm'],
    'with my parents': ['family', 'drama', 'comedy'],
    'with the family': ['family', 'animation', 'adventure'],
    'no violence': ['family', 'comedy', 'romance'],
    'award winning': ['acclaimed', 'oscar', 'best picture'],
    'critically acclaimed': ['acclaimed', 'top rated', 'masterpiece'],
    underrated: ['hidden gem', 'overlooked', 'sleeper hit'],
    'comfort watch': ['comedy', 'family', 'feel-good'],
  };

  // Mood keywords that describe tone rather than genre
  private static readonly MOOD_KEYWORDS: Record<SearchMood, string[]> = {
    dark: [
      'dark',
      'gritty',
      'bleak',
      'noir',
      'disturbing',
      'sinister',
      'twisted',
      'brutal',
    ],
    light: [
      'light',
      'lighthearted',
      'light-hearted',
      'cheerful',
      'bright',
      'fun',
      'easy',
      'casual',
      'cozy',
      'feel-good',
      'feel good',
      'upbeat',
    ],
    intense: [
      'intense',
      'gripping',
      'nail-biting',
      'heart-pounding',
      'edge',
      'riveting',
      'fast-paced',
      'explosive',
    ],
    cerebral: [
      'cerebral',
      'thought-provoking',
      'smart',
      'clever',
      'intellectual',
      'complex',
      'deep',
      'philosophical',
      'mind-bending',
      'mind bending',
    ],
    nostalgic: [
      'nostalgic',
      'retro',
      'throwback',
      'classic',
      'old school',
      'vintage',
      'timeless',
    ],
    uplifting: [
      'uplifting',
      'inspiring',
      'heartwarming',
      'hopeful',
      'motivating',
      'empowering',
      'triumphant',
      'feel-good',
    ],
  };

  // Era/time-period keywords
  private static readonly ERA_KEYWORDS: Record<SearchEra, string[]> = {
    classic: ['classic', 'old', 'golden age', 'timeless', 'vintage'],
    retro: ['retro', '80s', '90s', 'eighties', 'nineties', 'throwback'],
    modern: ['modern', '2000s', '2010s', 'contemporary'],
    recent: [
      'recent',
      'new',
      'latest',
      'newest',
      'brand new',
      'just released',
      '2020s',
      '2024',
      '2025',
      '2026',
    ],
  };

  // Audience-targeting keywords
  private static readonly AUDIENCE_KEYWORDS: Record<SearchAudience, string[]> =
    {
      kids: [
        'kids',
        'children',
        'toddler',
        'preschool',
        'young kids',
        'little ones',
      ],
      family: [
        'family',
        'family-friendly',
        'all ages',
        'everyone',
        'wholesome',
        'with the family',
        'with my parents',
      ],
      date: [
        'date night',
        'date',
        'couple',
        'romantic evening',
        'girls night',
        "girls' night",
      ],
      mature: ['mature', 'adult', 'grown-up', 'serious', 'gritty'],
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
    const joined = keywords.join(' ');
    Object.entries(this.GENRE_KEYWORDS).forEach(([genre, cues]) => {
      if (!cues) return;
      const matchCue = cues.some((cue) => {
        if (cue.includes(' ')) {
          return joined.includes(cue);
        }
        return keywords.some((word) => {
          const pattern = new RegExp(`\\b${this.escapeRegex(cue)}\\b`, 'i');
          return pattern.test(word);
        });
      });
      if (matchCue) {
        matches.add(Number(genre) as Genre);
      }
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
      case Genre.HISTORY:
        return 'History';
      case Genre.MYSTERY:
        return 'Mystery';
      case Genre.TV_MOVIE:
        return 'TV Movie';
      case Genre.WAR:
        return 'War';
      case Genre.WESTERN:
        return 'Western';
      case Genre.ACTION_ADVENTURE:
        return 'Action & Adventure';
      case Genre.KIDS:
        return 'Kids';
      case Genre.NEWS:
        return 'News';
      case Genre.REALITY:
        return 'Reality';
      case Genre.SCIFI_FANTASY:
        return 'Sci-Fi & Fantasy';
      case Genre.SOAP:
        return 'Soap';
      case Genre.TALK:
        return 'Talk';
      case Genre.WAR_POLITICS:
        return 'War & Politics';
      default:
        return 'Top Pick';
    }
  }

  /**
   * Expands natural language phrases found in the query into keyword tokens.
   * E.g. "feel good" → ['comedy', 'family', 'uplifting']
   */
  private static expandNaturalLanguagePhrases(text: string): string[] {
    const lower = text.toLowerCase();
    const expanded: string[] = [];
    for (const [phrase, keywords] of Object.entries(this.NL_PHRASE_MAP)) {
      if (lower.includes(phrase)) {
        expanded.push(...keywords);
      }
    }
    return expanded;
  }

  /**
   * Detects the mood/tone of a search query.
   */
  private static detectMood(text: string): SearchMood | undefined {
    const lower = text.toLowerCase();
    for (const [mood, cues] of Object.entries(this.MOOD_KEYWORDS)) {
      if (cues.some((cue) => lower.includes(cue))) {
        return mood as SearchMood;
      }
    }
    return undefined;
  }

  /**
   * Detects the era/time-period preference in a query.
   */
  private static detectEra(text: string): SearchEra | undefined {
    const lower = text.toLowerCase();
    for (const [era, cues] of Object.entries(this.ERA_KEYWORDS)) {
      if (cues.some((cue) => lower.includes(cue))) {
        return era as SearchEra;
      }
    }
    return undefined;
  }

  /**
   * Detects the target audience from a query.
   */
  private static detectAudience(text: string): SearchAudience | undefined {
    const lower = text.toLowerCase();
    for (const [audience, cues] of Object.entries(this.AUDIENCE_KEYWORDS)) {
      if (cues.some((cue) => lower.includes(cue))) {
        return audience as SearchAudience;
      }
    }
    return undefined;
  }

  /**
   * Maps mood to genre IDs that typically match the mood.
   */
  private static moodToGenres(mood: SearchMood): Set<Genre> {
    switch (mood) {
      case 'dark':
        return new Set([Genre.THRILLER, Genre.HORROR, Genre.CRIME]);
      case 'light':
        return new Set([Genre.COMEDY, Genre.FAMILY, Genre.ROMANCE]);
      case 'intense':
        return new Set([Genre.ACTION, Genre.THRILLER, Genre.CRIME]);
      case 'cerebral':
        return new Set([Genre.SCIENCE_FICTION, Genre.MYSTERY, Genre.DRAMA]);
      case 'nostalgic':
        return new Set([Genre.DRAMA, Genre.COMEDY, Genre.FAMILY]);
      case 'uplifting':
        return new Set([Genre.DRAMA, Genre.COMEDY, Genre.FAMILY]);
    }
  }

  /**
   * Extracts the release year from a show's release_date or first_air_date.
   */
  private static extractYear(show: Show): number | undefined {
    const dateStr = show.release_date ?? show.first_air_date;
    if (!dateStr) return undefined;
    const year = new Date(dateStr).getFullYear();
    return isNaN(year) ? undefined : year;
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

    // Expand natural language phrases before tokenizing
    const nlExpansions = this.expandNaturalLanguagePhrases(trimmed);

    const tokens = this.tokenize(trimmed);
    if (!tokens.length && !nlExpansions.length) {
      return Promise.resolve(trimmed);
    }

    // Combine original tokens with NL-expanded keywords (deduplicated)
    const combined = Array.from(new Set([...tokens, ...nlExpansions]));
    const cleaned = combined.join(' ');
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

  static analyzeSearchIntent(query: string): Promise<NaturalLanguageIntent> {
    const lower = query.toLowerCase();
    const keywords = this.tokenize(query);

    // Expand natural language phrases for genre detection
    const nlExpansions = this.expandNaturalLanguagePhrases(query);
    const allKeywords = Array.from(new Set([...keywords, ...nlExpansions]));
    const genreHints = this.deriveGenres(allKeywords);

    // Detect mood, era, and audience from the original query text
    const mood = this.detectMood(lower);
    const era = this.detectEra(lower);
    const audience = this.detectAudience(lower);

    // If mood detected but no genre hints, derive genres from mood
    if (mood && genreHints.size === 0) {
      const moodGenres = this.moodToGenres(mood);
      moodGenres.forEach((g) => genreHints.add(g));
    }

    // Audience-based genre hints
    if (audience === 'kids' || audience === 'family') {
      genreHints.add(Genre.FAMILY);
      genreHints.add(Genre.ANIMATION);
    } else if (audience === 'date') {
      genreHints.add(Genre.ROMANCE);
      genreHints.add(Genre.COMEDY);
    }

    const isTv =
      lower.includes('season') ||
      lower.includes('episode') ||
      lower.includes('tv') ||
      lower.includes('series') ||
      lower.includes('binge');
    const isMovie =
      lower.includes('movie') ||
      lower.includes('film') ||
      lower.includes('cinema');

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
      keywords: allKeywords.length ? allKeywords : query.split(' '),
      mood,
      era,
      audience,
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
    const nlExpansions = this.expandNaturalLanguagePhrases(prompt);
    const allKeywords = Array.from(new Set([...keywords, ...nlExpansions]));
    const genreHints = this.deriveGenres(allKeywords);
    const mood = this.detectMood(prompt);
    const era = this.detectEra(prompt);

    // If mood is detected, add mood-related genres to genre hints
    if (mood) {
      const moodGenres = this.moodToGenres(mood);
      moodGenres.forEach((g) => genreHints.add(g));
    }

    const VOTE_WEIGHT = 5;
    const POPULARITY_WEIGHT = 0.4;
    const MOOD_GENRE_WEIGHT = 20;
    const ERA_WEIGHT = 15;

    const currentYear = new Date().getFullYear();

    const scored = shows.map((show) => {
      const title = `${show.title ?? ''} ${show.name ?? ''}`.toLowerCase();
      const overview = (show.overview ?? '').toLowerCase();
      const genreIds =
        (show as Partial<{ genre_ids: number[] }>).genre_ids ?? [];

      let score =
        (show.vote_average ?? 0) * VOTE_WEIGHT +
        (show.popularity ?? 0) * POPULARITY_WEIGHT +
        (show.id % this.SEARCH_DIVERSITY_MOD);

      allKeywords.forEach((keyword) => {
        if (title.includes(keyword)) {
          score += 60;
        } else if (overview.includes(keyword)) {
          score += 30;
        }
      });

      if (genreIds.some((id) => genreHints.has(id as Genre))) {
        score += 25;
      }

      // Mood-derived genre bonus
      if (mood) {
        const moodGenres = this.moodToGenres(mood);
        if (genreIds.some((id) => moodGenres.has(id as Genre))) {
          score += MOOD_GENRE_WEIGHT;
        }
      }

      // Era-based scoring
      if (era) {
        const releaseYear = this.extractYear(show);
        if (releaseYear) {
          switch (era) {
            case 'classic':
              if (releaseYear < 1980) score += ERA_WEIGHT;
              break;
            case 'retro':
              if (releaseYear >= 1980 && releaseYear < 2000)
                score += ERA_WEIGHT;
              break;
            case 'modern':
              if (releaseYear >= 2000 && releaseYear < 2020)
                score += ERA_WEIGHT;
              break;
            case 'recent':
              if (releaseYear >= currentYear - 2) score += ERA_WEIGHT;
              break;
          }
        }
      }

      return { showId: show.id, score };
    });

    const matches = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry) => ({ showId: entry.showId }));

    const parts: string[] = [];
    if (allKeywords.length > 0) {
      parts.push(`themes like ${allKeywords.slice(0, 4).join(', ')}`);
    }
    if (mood) {
      parts.push(`a ${mood} mood`);
    }
    if (era) {
      parts.push(`${era} era`);
    }

    const explanation =
      parts.length > 0
        ? `Matched shows to ${parts.join(' and ')}.`
        : 'Showing a curated mix of popular titles.';

    return Promise.resolve({
      matches,
      explanation,
    });
  }
}

export default AIService;
