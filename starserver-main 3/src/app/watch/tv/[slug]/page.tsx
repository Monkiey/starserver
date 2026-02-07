import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';
import MovieService from '@/services/MovieService';
import { getIdFromSlug, getNameFromShow } from '@/lib/utils';

export const revalidate = 3600;

export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const id = getIdFromSlug(params.slug);
  const season =
    typeof searchParams.season === 'string' ? searchParams.season : null;
  const episode =
    typeof searchParams.episode === 'string' ? searchParams.episode : null;

  let show;
  try {
    show = await MovieService.findMovieByIdAndType(id, 'tv');
  } catch (error) {
    show = null;
  }

  const heroImage =
    show?.backdrop_path ?? show?.poster_path
      ? `https://image.tmdb.org/t/p/original${
          show.backdrop_path ?? show.poster_path
        }`
      : '/images/grey-thumbnail.jpg';

  const url =
    season && episode
      ? `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`
      : `https://vidsrc.cc/v2/embed/tv/${id}`;

  return (
    <EmbedPlayer
      url={url}
      backdrop={heroImage}
      title={show ? getNameFromShow(show) : undefined}
      show={show ?? undefined}
    />
  );
}
