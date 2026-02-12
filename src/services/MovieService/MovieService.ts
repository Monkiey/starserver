import { getNameFromShow, getSlug } from '@/lib/utils';
import { MediaType } from '@/types';
import type {
  CategorizedShows,
  ISeason,
  KeyWordResponse,
  Show,
  ShowWithGenreAndVideo,
} from '@/types';
import { type AxiosResponse } from 'axios';
import BaseService from '../BaseService/BaseService';
import {
  RequestType,
  type ShowRequest,
  type TmdbPagingResponse,
  type TmdbRequest,
} from '@/enums/request-type';
import { Genre } from '@/enums/genre';
import { cache } from 'react';

const requestTypesNeedUpdateMediaType = [
  RequestType.TOP_RATED,
  RequestType.NETFLIX,
  RequestType.POPULAR,
  RequestType.GENRE,
  RequestType.KOREAN,
];
const baseUrl = 'https://api.themoviedb.org/3';

class MovieService extends BaseService {
  static async findCurrentMovie(id: number, pathname: string): Promise<Show> {
    const data = await Promise.allSettled([
      this.findMovie(id),
      this.findTvSeries(id),
    ]);
    const response = data
      .filter(this.isFulfilled)
      .map(
        (item: PromiseFulfilledResult<AxiosResponse<Show>>) => item.value?.data,
      )
      .filter((item: Show) => {
        return pathname.includes(getSlug(item.id, getNameFromShow(item)));
      });
    if (!response?.length) {
      return Promise.reject('not found');
    }
    return Promise.resolve<Show>(response[0]);
  }

  static findMovie = cache(async (id: number) => {
    return this.axios(baseUrl).get<Show>(
      `/movie/${id}?append_to_response=keywords`,
    );
  });

  static findTvSeries = cache(async (id: number) => {
    return this.axios(baseUrl).get<Show>(
      `/tv/${id}?append_to_response=keywords`,
    );
  });

  static async getKeywords(
    id: number,
    type: 'tv' | 'movie',
  ): Promise<AxiosResponse<KeyWordResponse>> {
    return this.axios(baseUrl).get<KeyWordResponse>(`/${type}/${id}/keywords`);
  }

  static async getSeasons(
    id: number,
    season: number,
  ): Promise<AxiosResponse<ISeason>> {
    return this.axios(baseUrl).get<ISeason>(`/tv/${id}/season/${season}`);
  }

  static findMovieByIdAndType = cache(async (id: number, type: string) => {
    const params: Record<string, string> = {
      language: 'en-US',
      append_to_response: 'videos,keywords',
    };
    const response: AxiosResponse<ShowWithGenreAndVideo> = await this.axios(
      baseUrl,
    ).get<ShowWithGenreAndVideo>(`/${type}/${id}`, { params });
    return Promise.resolve(response.data);
  });

  static urlBuilder(req: TmdbRequest) {
    switch (req.requestType) {
      case RequestType.ANIME_LATEST:
        return `/discover/${req.mediaType}?with_keywords=210024%2C&language=en-US&sort_by=primary_release_date.desc&release_date.lte=2024-11-10&with_runtime.gte=1`;
      case RequestType.ANIME_TRENDING:
        return `/discover/${req.mediaType}?with_keywords=210024%2C&language=en-US&sort_by=popularity.desc&release_date.lte=2024-11-10&with_runtime.gte=1`;
      case RequestType.ANIME_TOP_RATED:
        return `/discover/${req.mediaType}?with_keywords=210024%2C&language=en-US&sort_by=vote_count.desc&air_date.lte=2024-11-10`;
      case RequestType.ANIME_NETFLIX:
        return `/discover/${req.mediaType}?with_keywords=210024%2C&with_networks=213&language=en-US`;
      case RequestType.TRENDING:
        return `/trending/${
          req.mediaType
        }/day?language=en-US&with_original_language=en&page=${req.page ?? 1}`;
      case RequestType.TOP_RATED:
        return `/${req.mediaType}/top_rated?page=${
          req.page ?? 1
        }&with_original_language=en&language=en-US`;
      case RequestType.NETFLIX:
        return `/discover/${
          req.mediaType
        }?with_networks=213&with_original_language=en&language=en-US&page=${
          req.page ?? 1
        }`;
      case RequestType.POPULAR:
        return `/${
          req.mediaType
        }/popular?language=en-US&with_original_language=en&page=${
          req.page ?? 1
        }&without_genres=${Genre.TALK},${Genre.NEWS}`;
      case RequestType.GENRE:
        return `/discover/${req.mediaType}?with_genres=${
          req.genre
        }&language=en-US&with_original_language=en&page=${
          req.page ?? 1
        }&without_genres=${Genre.TALK},${Genre.NEWS}`;
      case RequestType.ANIME_GENRE:
        return `/discover/${req.mediaType}?with_genres=${
          req.genre
        }&with_keywords=210024%2C&language=en-US&with_original_language=en&page=${
          req.page ?? 1
        }&without_genres=${Genre.TALK},${Genre.NEWS}`;
      case RequestType.KOREAN:
        return `/discover/${req.mediaType}?with_genres=${
          req.genre
        }&with_original_language=ko&language=en-US&page=${req.page ?? 1}`;
      default:
        throw new Error(
          `request type ${req.requestType} is not implemented yet`,
        );
    }
  }

  static executeRequest(req: {
    requestType: RequestType;
    mediaType: MediaType;
    page?: number;
  }) {
    return this.axios(baseUrl).get<TmdbPagingResponse>(this.urlBuilder(req));
  }

  static getShows = async (requests: ShowRequest[]) => {
    const shows: CategorizedShows[] = [];
    const promises = requests.map((m) => this.executeRequest(m.req));
    const responses = await Promise.allSettled(promises);
    for (let i = 0; i < requests.length; i++) {
      const res = responses[i];
      if (this.isRejected(res)) {
        console.warn(`Failed to fetch shows ${requests[i].title}`, res.reason);
        shows.push({
          title: requests[i].title,
          shows: [],
          visible: requests[i].visible,
        });
      } else if (this.isFulfilled(res)) {
        if (
          requestTypesNeedUpdateMediaType.indexOf(requests[i].req.requestType) >
          -1
        ) {
          res.value.data.results.forEach(
            (f) => (f.media_type = requests[i].req.mediaType),
          );
        }
        shows.push({
          title: requests[i].title,
          shows: res.value.data.results,
          visible: requests[i].visible,
        });
      } else {
        throw new Error('unexpected response');
      }
    }
    return shows;
  };

  static getTrendingAll = cache(async (page?: number) => {
    const { data } = await this.axios(baseUrl).get<TmdbPagingResponse>(
      `/trending/all/week?language=en-US&page=${page ?? 1}`,
    );
    return data;
  });

  static searchMovies = cache(async (query: string, page?: number) => {
    const normalizedQuery = query.trim().toLowerCase();
    const { data } = await this.axios(baseUrl).get<TmdbPagingResponse>(
      `/search/multi?query=${encodeURIComponent(
        normalizedQuery,
      )}&language=en-US&include_adult=false&page=${page ?? 1}`,
    );

    const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
    data.results = data.results
      .filter(
        (result) =>
          result.media_type === MediaType.MOVIE ||
          result.media_type === MediaType.TV,
      )
      .sort((a, b) => {
        const getScore = (item: Show) => {
          const title = `${item.title ?? ''}${item.name ?? ''}`.toLowerCase();
          let score = item.popularity ?? 0;
          if (title === normalizedQuery) score += 5000;
          if (title.startsWith(normalizedQuery)) score += 2500;
          if (queryWords.every((word) => title.includes(word))) {
            score += 1500;
          }
          return score;
        };
        return getScore(b) - getScore(a);
      });
    return data;
  });
}

export default MovieService;
