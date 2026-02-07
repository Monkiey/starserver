import { siteConfig } from '@/configs/site';
import React from 'react';
import MainNav from '@/components/navigation/main-nav';

const SiteHeader = () => {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-[4vw] pb-3 pt-4">
      <MainNav items={siteConfig.mainNav} />
    </header>
  );
};

export default SiteHeader;
