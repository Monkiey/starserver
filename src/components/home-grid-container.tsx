'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import type { CategorizedShows, Show } from '@/types';
import { getIdFromSlug } from '@/lib/utils';
import ShowModal from '@/components/shows-modal';
import HomeGridSection from '@/components/home-grid-section';
import { useModalStore } from '@/stores/modal';
import { type AxiosResponse } from 'axios';
import MovieService from '@/services/MovieService';

interface HomeGridContainerProps {
  shows: CategorizedShows[];
}

const HomeGridContainer = ({ shows }: HomeGridContainerProps) => {
  const pathname = usePathname();
  const modalStore = useModalStore();

  React.useEffect(() => {
    void handleOpenModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = async (): Promise<void> => {
    if (!/\d/.test(pathname) || modalStore.open) {
      return;
    }
    const movieId: number = getIdFromSlug(pathname);
    if (!movieId) {
      return;
    }
    try {
      const response: AxiosResponse<Show> = pathname.includes('/tv-shows')
        ? await MovieService.findTvSeries(movieId)
        : await MovieService.findMovie(movieId);
      const data: Show = response.data;
      if (data) {
        useModalStore.setState({
          show: data,
          open: true,
          play: true,
          firstLoad: true,
        });
      }
    } catch (error) {
      console.error('HomeGridContainer: failed to open modal from URL', error);
    }
  };

  return (
    <>
      {modalStore.open && <ShowModal />}
      <div className="pb-8">
        {shows.map((item, idx) =>
          item.visible ? (
            <HomeGridSection
              key={item.title}
              title={item.title}
              shows={item.shows ?? []}
              featured={idx === 0}
            />
          ) : null,
        )}
      </div>
    </>
  );
};

export default HomeGridContainer;
