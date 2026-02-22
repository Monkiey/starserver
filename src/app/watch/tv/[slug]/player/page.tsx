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

  const sources =
    season && episode
      ? [
          {
            label: 'VidSrc',
            url: `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`,
          },
          {
            label: 'VidSrc.to',
            url: `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
          },
          {
            label: 'Embed.su',
            url: `https://embed.su/embed/tv/${id}/${season}/${episode}`,
          },
        ]
      : [
          { label: 'VidSrc', url: `https://vidsrc.cc/v2/embed/tv/${id}` },
          { label: 'VidSrc.to', url: `https://vidsrc.to/embed/tv/${id}` },
          { label: 'Embed.su', url: `https://embed.su/embed/tv/${id}` },
        ];

  return <EmbedPlayer sources={sources} />;
}
