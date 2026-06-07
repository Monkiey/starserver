import React from 'react';
import OmssPlayer from '@/components/watch/omss-player';
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

  return (
    <OmssPlayer
      tmdbId={id}
      showId={showId}
      mediaType={MediaType.TV}
      season={searchParams?.season}
      episode={searchParams?.episode}
    />
  );
}
