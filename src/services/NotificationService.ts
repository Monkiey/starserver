import { type Show, MediaType, type NextEpisodeToAir } from '@/types';
import BaseService from './BaseService/BaseService';

const baseUrl = 'https://api.themoviedb.org/3';

type TvNotificationDetails = {
  next_episode_to_air: NextEpisodeToAir | null;
  status: string;
};

type MovieNotificationDetails = {
  status: string;
  release_date: string | null;
};

class NotificationService extends BaseService {
  /** Fetches just the fields needed to check for new TV episodes. */
  static async getTvNotificationDetails(
    id: number,
  ): Promise<TvNotificationDetails> {
    const { data } = await this.axios(baseUrl).get<TvNotificationDetails>(
      `/tv/${id}`,
    );
    return data;
  }

  /** Fetches just the fields needed to check movie release status. */
  static async getMovieNotificationDetails(
    id: number,
  ): Promise<MovieNotificationDetails> {
    const { data } = await this.axios(baseUrl).get<MovieNotificationDetails>(
      `/movie/${id}`,
    );
    return data;
  }

  /**
   * Returns a stable notification key for a TV episode so that each episode
   * is only notified once.
   */
  static tvEpisodeKey(
    show: Show,
    episode: NextEpisodeToAir,
  ): string {
    return `tv-${show.id}-s${episode.season_number}e${episode.episode_number}`;
  }

  /** Returns a stable notification key for a movie release. */
  static movieReleaseKey(show: Show): string {
    return `movie-${show.id}-released`;
  }

  /** Sends a browser notification if permission has been granted. */
  static sendNotification(title: string, body: string, icon?: string): void {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    new Notification(title, {
      body,
      icon: icon ?? '/favicon.ico',
    });
  }

  /**
   * Checks a single watchlist item and fires a notification if new content is
   * available and hasn't been notified before.
   *
   * @returns the notification key that was fired, or null if nothing was sent.
   */
  static async checkItem(
    show: Show,
    opts: {
      notifyNewEpisodes: boolean;
      notifyNewReleases: boolean;
      isNotified: (key: string) => boolean;
    },
  ): Promise<string | null> {
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    if (show.media_type === MediaType.TV && opts.notifyNewEpisodes) {
      const details = await this.getTvNotificationDetails(show.id);
      const next = details.next_episode_to_air;
      if (next && next.air_date && next.air_date <= today) {
        const key = this.tvEpisodeKey(show, next);
        if (!opts.isNotified(key)) {
          this.sendNotification(
            `New episode: ${show.name ?? show.title}`,
            `S${next.season_number}E${next.episode_number} – "${next.name}" is now available.`,
          );
          return key;
        }
      }
    }

    if (show.media_type === MediaType.MOVIE && opts.notifyNewReleases) {
      const details = await this.getMovieNotificationDetails(show.id);
      if (
        details.status === 'Released' &&
        details.release_date &&
        details.release_date <= today
      ) {
        const key = this.movieReleaseKey(show);
        if (!opts.isNotified(key)) {
          this.sendNotification(
            `Now available: ${show.title ?? show.name}`,
            `"${show.title ?? show.name}" has been released.`,
          );
          return key;
        }
      }
    }

    return null;
  }
}

export default NotificationService;
