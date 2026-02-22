import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';

export const revalidate = 3600;

export default function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop();
  return (
    <EmbedPlayer
      sources={[
        { label: 'VidSrc', url: `https://vidsrc.cc/v2/embed/movie/${id}` },
        { label: 'VidSrc.to', url: `https://vidsrc.to/embed/movie/${id}` },
        { label: 'Embed.su', url: `https://embed.su/embed/movie/${id}` },
      ]}
    />
  );
}
