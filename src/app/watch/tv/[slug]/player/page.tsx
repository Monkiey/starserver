import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';

export const revalidate = 3600;

export default function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { season?: string; episode?: string };
}) {
  const id = params.slug.split('-').pop();
  const season = searchParams?.season;
  const episode = searchParams?.episode;
  const url =
    season && episode
      ? `https://player.videasy.net/tv/${id}/${season}/${episode}`
      : `https://player.videasy.net/tv/${id}`;
  return <EmbedPlayer url={url} />;
}
