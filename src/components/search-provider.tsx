'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useModalStore } from '@/stores/modal';

const SearchDialog = dynamic(() => import('@/components/search-dialog'), {
  ssr: false,
});

const ShowModal = dynamic(() => import('@/components/shows-modal'), {
  ssr: false,
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const modalStore = useModalStore();

  return (
    <>
      {children}
      <SearchDialog />
      {modalStore.open && <ShowModal />}
    </>
  );
}

export default SearchProvider;
