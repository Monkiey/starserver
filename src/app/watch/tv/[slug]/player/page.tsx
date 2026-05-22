import React from 'react';
import NativePlayer from '@/components/watch/native-player';
import { MediaType } from '@/types';

export const revalidate = 3600;

export default function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { season?: string; episode?: string };
}) {
  const id = params.slug.split('-').pop();
  const showId = id ? Number(id) : undefined;
  const season = searchParams?.season;
  const episode = searchParams?.episode;
  const url =
    season && episode
      ? `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`
      : `https://vidsrc.cc/v2/embed/tv/${id}`;
  return <NativePlayer src={url} showId={showId} mediaType={MediaType.TV} />;
}
