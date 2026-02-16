'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const SearchDialog = dynamic(() => import('@/components/search-dialog'), {
  ssr: false,
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SearchDialog />
    </>
  );
}

export default SearchProvider;
