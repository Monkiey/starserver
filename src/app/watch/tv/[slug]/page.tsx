import React from 'react';
import { redirect } from 'next/navigation';
import MovieService from '@/services/MovieService';
import { type ISeason } from '@/types';
import TvDetailContent from '@/components/watch/tv-detail-content';

export const revalidate = 3600;

export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { season?: string; episode?: string };
}) {
  const id = Number(params.slug.split('-').pop());

  if (!id) {
    redirect('/');
  }

  if (searchParams?.season && searchParams?.episode) {
    redirect(
      `/watch/tv/${id}/player?season=${searchParams.season}&episode=${searchParams.episode}`,
    );
  }

  const show = await MovieService.findMovieByIdAndType(id, 'tv');
  const filteredSeasons =
    show.seasons?.filter((season: ISeason) => season.season_number) ?? [];

  const seasonRequests = await Promise.all(
    filteredSeasons.map((season: ISeason) =>
      MovieService.getSeasons(id, season.season_number),
    ),
  );

  const seasons = seasonRequests.map((res) => res.data);

  return <TvDetailContent show={show} seasons={seasons} />;
}
