import React from 'react';
import { siteConfig } from '@/configs/site';

const SiteFooter = () => {
  return (
    <footer
      aria-label="Footer"
      className="w-full border-t border-white/25 bg-white/60 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
      <div className="container flex w-full max-w-6xl flex-col gap-4 py-10">
        <p className="text-sm font-semibold text-foreground/80">
          {siteConfig.name}
        </p>
        <p className="text-sm text-foreground/60">
          Crafted for distraction-free streaming with a liquid glass finish
          tuned for tvOS.
        </p>
        <p className="text-xs text-foreground/50">
          © 2023-{new Date().getFullYear()} {siteConfig.author}
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;
