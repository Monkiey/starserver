'use client';

import React from 'react';
import type { Show } from '@/types';
import ShowsGrid from '@/components/shows-grid';
import { useSearchStore } from '@/stores/search';

interface SearchContainer {
  query: string;
  shows: Show[];
}

function SearchContainer({ shows, query }: SearchContainer) {
  const searchStore = useSearchStore();

  React.useEffect(() => {
    searchStore.setQuery(query);
    searchStore.setShows(shows);
  }, []);

  return <ShowsGrid shows={searchStore.shows} query={searchStore.query} />;
}

export default SearchContainer;
