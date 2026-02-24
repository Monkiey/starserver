'use client';

import React from 'react';
import CustomImage from '@/components/custom-image';
import { Icons } from '@/components/icons';
import { useContinueWatchingStore } from '@/stores/continue-watching';
import { useWatchlistStore } from '@/stores/watchlist';
import { useModalStore } from '@/stores/modal';
import { MediaType, type Show } from '@/types';
import { cn, getNameFromShow, getSlug } from '@/lib/utils';

const ContinueWatching = () => {
  const { items, removeItem } = useContinueWatchingStore();
  const { items: watchlistItems } = useWatchlistStore();

  if (!items.length && !watchlistItems.length) {
    return null;
  }

  return (
    <>
      {items.length > 0 && (
        <section className="relative my-[3vw] p-0">
          <div className="space-y-2">
            <h2 className="m-0 px-[4%] text-lg font-semibold text-foreground/80 transition-colors hover:text-foreground sm:text-xl 2xl:px-[60px]">
              Continue Watching
            </h2>
            <div className="no-scrollbar m-0 grid auto-cols-[calc(100%/2.5)] grid-flow-col gap-2 overflow-x-auto px-[4%] py-2 sm:auto-cols-[35%] md:auto-cols-[25%] lg:auto-cols-[20%] xl:auto-cols-[calc(100%/6)] 2xl:px-[60px]">
              {items.map((show) => (
                <ContinueWatchingCard
                  key={`${show.media_type}-${show.id}`}
                  show={show}
                  onRemove={() => removeItem(show.id, show.media_type)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      {watchlistItems.length > 0 && (
        <section className="relative my-[3vw] p-0">
          <div className="space-y-2">
            <h2 className="m-0 px-[4%] text-lg font-semibold text-foreground/80 transition-colors hover:text-foreground sm:text-xl 2xl:px-[60px]">
              My List
            </h2>
            <div className="no-scrollbar m-0 grid auto-cols-[calc(100%/2.5)] grid-flow-col gap-2 overflow-x-auto px-[4%] py-2 sm:auto-cols-[35%] md:auto-cols-[25%] lg:auto-cols-[20%] xl:auto-cols-[calc(100%/6)] 2xl:px-[60px]">
              {watchlistItems.map((show) => (
                <ContinueWatchingCard
                  key={`${show.media_type}-${show.id}`}
                  show={show}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

const ContinueWatchingCard = ({
  show,
  onRemove,
}: {
  show: Show;
  onRemove?: () => void;
}) => {
  const { addItem, removeItem: removeFromWatchlist, isInWatchlist } = useWatchlistStore();
  const starred = isInWatchlist(show.id, show.media_type);

  const imageOnErrorHandler = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    event.currentTarget.src = '/images/grey-thumbnail.jpg';
  };

  return (
    <div className="group relative aspect-[2/3] overflow-hidden rounded-xl">
      <button
        aria-label={`Remove ${getNameFromShow(show)} from continue watching`}
        className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-sm text-foreground opacity-0 shadow-sm transition group-hover:opacity-100"
        onClick={(event) => {
          event.stopPropagation();
          onRemove?.();
        }}>
        ✕
      </button>
      <button
        aria-label={
          starred
            ? `Remove ${getNameFromShow(show)} from watchlist`
            : `Add ${getNameFromShow(show)} to watchlist`
        }
        className="absolute right-11 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-sm text-foreground opacity-0 shadow-sm transition group-hover:opacity-100"
        onClick={(event) => {
          event.stopPropagation();
          if (starred) {
            removeFromWatchlist(show.id, show.media_type);
          } else {
            addItem(show);
          }
        }}>
        <Icons.star
          className={cn('h-4 w-4', starred && 'fill-yellow-400 text-yellow-400')}
        />
      </button>
      <CustomImage
        src={
          show.poster_path ?? show.backdrop_path
            ? `https://image.tmdb.org/t/p/w500${
                show.poster_path ?? show.backdrop_path
              }`
            : '/images/grey-thumbnail.jpg'
        }
        alt={show.title ?? show.name ?? 'poster'}
        className={cn(
          'h-full w-full cursor-pointer rounded-xl transition-all',
          'md:group-hover:scale-105',
        )}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 100vw, 33vw"
        style={{ objectFit: 'cover' }}
        onClick={() => {
          const name = getNameFromShow(show);
          const path = show.media_type === MediaType.TV ? 'tv-shows' : 'movies';
          window.history.pushState(
            null,
            '',
            `${path}/${getSlug(show.id, name)}`,
          );
          useModalStore.setState({
            show,
            open: true,
            play: true,
          });
        }}
        onError={imageOnErrorHandler}
      />
    </div>
  );
};

export default ContinueWatching;
