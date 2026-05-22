import React from 'react';
import NativePlayer from '@/components/watch/native-player';
import { MediaType } from '@/types';

export const revalidate = 3600;

export default function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop();
  const showId = id ? Number(id) : undefined;
  return (
    <NativePlayer
      src={`https://vidsrc.cc/v2/embed/movie/${id}`}
      showId={showId}
      mediaType={MediaType.MOVIE}
    />
  );
}
