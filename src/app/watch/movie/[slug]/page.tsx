import React from 'react';
import VideoPlayer from '@/components/watch/embed-player';

export const revalidate = 3600;

export default function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop();
  return <VideoPlayer url={`https://vidsrc.cc/v2/embed/movie/${id}`} />;
}
