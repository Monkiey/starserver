'use client';

import React from 'react';
import Loading from '@/components/ui/loading';

export function LoadingState({
  message,
}: {
  message?: string | React.ReactNode;
}) {
  const displayMessage = message ?? 'Loading media...';

  return (
    <div className="flex h-screen min-h-[400px] w-full flex-col items-center justify-center gap-4 bg-black text-white">
      <Loading className="h-12 w-12 text-primary" />
      <div className="animate-pulse font-medium text-zinc-400">
        {displayMessage}
      </div>
    </div>
  );
}
