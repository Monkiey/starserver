'use client';

import { usePathname } from 'next/navigation';
// import { useMounted } from '@/hooks/use-mounted';
// import { useModalStore } from "@/stores/modal"
// import { useProfileStore } from "@/stores/profile"
import { useSearchStore } from '@/stores/search';
import type { CategorizedShows } from '@/types';

// import { api } from "@/lib/api/api"
import { getIdFromSlug } from '@/lib/utils';
import ShowModal from '@/components/shows-modal';
import ShowsCarousel from '@/components/shows-carousel';
import ShowsGrid from '@/components/shows-grid';
// import ShowsSkeleton from '@/components/shows-skeleton';
import { useModalStore } from '@/stores/modal';
import React from 'react';
import { type Show } from '@/types/index';
import { type AxiosResponse } from 'axios';
import MovieService from '@/services/MovieService';

interface ShowsContainerProps {
  show?: Show;
  shows: CategorizedShows[];
}

const ShowsContainer = ({ shows }: ShowsContainerProps) => {
  // const mounted = useMounted();
  const pathname = usePathname();

  // stores
  const modalStore = useModalStore();
  const searchStore = useSearchStore();

  const handleOpenModal = React.useCallback(async (): Promise<void> => {
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

      if (data)
        useModalStore.setState({
          show: data,
          open: true,
          play: true,
          firstLoad: true,
        });
    } catch (error) {}
  }, [modalStore.open, pathname]);

  React.useEffect(() => {
    void handleOpenModal();
  }, [handleOpenModal]);

  // if (!mounted) {
  //   return (
  //     <div className="mt-4 min-h-[800px] pt-[5%]">
  //       <ShowsSkeleton />
  //     </div>
  //   );
  // }

  if (searchStore.query.length > 0) {
    return (
      <div className="relative px-[4%] pb-16 pt-6">
        <div className="pointer-events-none absolute inset-0 bg-black/25" />
        <div className="relative">
          <ShowsGrid shows={searchStore.shows} query={searchStore.query} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 px-[4%] pb-14 pt-8">
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      <div className="relative space-y-7">
        {modalStore.open && <ShowModal />}
        {shows.map(
          (item) =>
            item.visible && (
              <ShowsCarousel
                key={item.title}
                title={item.title}
                shows={item.shows ?? []}
              />
            ),
        )}
      </div>
    </div>
  );
};

export default ShowsContainer;
