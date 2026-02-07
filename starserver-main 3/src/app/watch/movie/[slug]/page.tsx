import React from 'react';
import { notFound } from 'next/navigation';
import EmbedPlayer from '@/components/watch/embed-player';
import MovieService from '@/services/MovieService';
import { getIdFromSlug, getNameFromShow } from '@/lib/utils';

export const revalidate = 3600;

export default async function Page({ params }: { params: { slug: string } }) {
  const id = getIdFromSlug(params.slug);

  if (!id) {
    notFound();
  }

  let movie;
  try {
    movie = await MovieService.findMovieByIdAndType(id, 'movie');
  } catch (error) {
    movie = null;
  }

  const heroImage =
    movie?.backdrop_path ?? movie?.poster_path
      ? `https://image.tmdb.org/t/p/original${
          movie.backdrop_path ?? movie.poster_path
        }`
      : '/images/grey-thumbnail.jpg';

  return (
    <EmbedPlayer
      url={`https://vidsrc.cc/v2/embed/movie/${id}`}
      backdrop={heroImage}
      title={movie ? getNameFromShow(movie) : undefined}
      show={movie ?? undefined}
    />
  );
}
