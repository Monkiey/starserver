'use client';

import React from 'react';
import PageHeader from '@/components/page-header';
import CustomImage from '@/components/custom-image';
import { useWatchHistoryStore } from '@/stores/watch-history';
import { useModalStore } from '@/stores/modal';
import { MediaType } from '@/types';
import { cn, getNameFromShow, getSlug } from '@/lib/utils';

function formatWatchedAt(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function HistoryPage() {
  const { items, clear } = useWatchHistoryStore();

  return (
    <>
      <PageHeader
        title="Watch History"
        description="TV shows and movies you've played recently."
      />
      <div className="px-4 py-6 sm:px-6">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No watch history yet. Start playing something!
          </p>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <button
                onClick={clear}
                className="text-xs text-muted-foreground underline-offset-4 hover:underline">
                Clear history
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {items.map((item) => {
                const name = getNameFromShow(item);
                return (
                  <div
                    key={`${item.media_type}-${item.id}-${item.watchedAt}`}
                    className="group relative flex cursor-pointer flex-col gap-1"
                    onClick={() => {
                      const path =
                        item.media_type === MediaType.TV ? 'tv-shows' : 'movies';
                      window.history.pushState(
                        null,
                        '',
                        `${path}/${getSlug(item.id, name)}`,
                      );
                      useModalStore.setState({
                        show: item,
                        open: true,
                        play: false,
                      });
                    }}>
                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                      <CustomImage
                        src={
                          item.poster_path ?? item.backdrop_path
                            ? `https://image.tmdb.org/t/p/w500${
                                item.poster_path ?? item.backdrop_path
                              }`
                            : '/images/grey-thumbnail.jpg'
                        }
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                        style={{ objectFit: 'cover' }}
                        className={cn(
                          'h-full w-full rounded-xl transition-all',
                          'md:group-hover:scale-105',
                        )}
                        onError={(e) => {
                          e.currentTarget.src = '/images/grey-thumbnail.jpg';
                        }}
                      />
                    </div>
                    <div>
                      <p className="line-clamp-1 text-xs font-medium text-foreground">
                        {name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatWatchedAt(item.watchedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
