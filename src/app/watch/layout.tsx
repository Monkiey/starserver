import SiteHeader from '@/components/main/site-header';
import React from 'react';

const WatchLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-background">
      <SiteHeader />
      <main className="relative z-10 min-h-screen">{children}</main>
    </div>
  );
};

export default WatchLayout;
