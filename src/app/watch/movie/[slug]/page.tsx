import React from 'react';
import OmssPlayer from '@/components/watch/omss-player';
import { MediaType } from '@/types';
import { getIdFromSlug } from '@/lib/utils';

export const revalidate = 3600;

export default function Page({ params }: { params: { slug: string } }) {
  const numericId = getIdFromSlug(params.slug);
  const id = numericId > 0 ? String(numericId) : params.slug;

  return (
    <OmssPlayer tmdbId={id} showId={numericId} mediaType={MediaType.MOVIE} />
  );
}
