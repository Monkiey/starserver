import React from 'react';
import Link from 'next/link';
import { Play, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { siteConfig } from '@/configs/site';

const footerLinks = [
  {
    heading: 'Explore',
    items: [
      { title: 'Movies', href: '/movies' },
      { title: 'TV Shows', href: '/tv-shows' },
      { title: 'Trending', href: '/vodi#trending' },
      { title: 'Top Rated', href: '/vodi#top-rated' },
    ],
  },
  {
    heading: 'Genres',
    items: [
      { title: 'Action', href: '/movies' },
      { title: 'Comedy', href: '/movies' },
      { title: 'Drama', href: '/movies' },
      { title: 'Sci-Fi', href: '/movies' },
    ],
  },
  {
    heading: 'Support',
    items: [
      { title: 'Help Center', href: '/' },
      { title: 'Privacy Policy', href: '/' },
      { title: 'Terms of Use', href: '/terms-of-use' },
      { title: 'Contact Us', href: '/' },
    ],
  },
];

const socialIcons = [
  { icon: Facebook, title: 'Facebook', href: siteConfig.links.twitter },
  { icon: Instagram, title: 'Instagram', href: siteConfig.links.twitter },
  { icon: Twitter, title: 'Twitter', href: siteConfig.links.twitter },
  { icon: Youtube, title: 'YouTube', href: siteConfig.links.twitter },
];

export function VodiFooter() {
  return (
    <footer className="mt-20 bg-[#0d0d0d] pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        {/* Top row: logo + social */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-10 sm:flex-row sm:items-center">
          {/* Logo */}
          <Link href="/vodi" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-[#e63946]">
              <Play className="h-4 w-4 fill-white text-white" />
            </span>
            <span className="font-outfit text-xl font-bold uppercase tracking-wider text-white">
              {siteConfig.name}
            </span>
          </Link>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {socialIcons.map(({ icon: Icon, title, href }) => (
              <Link
                key={title}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={title}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/60 transition-colors hover:border-[#e63946] hover:bg-[#e63946]/10 hover:text-white">
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="mb-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/60 transition-colors hover:text-white">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">
              Newsletter
            </h3>
            <p className="mb-3 text-sm text-white/50">
              Get the latest updates on new releases.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex overflow-hidden rounded border border-white/20">
              <input
                type="email"
                placeholder="your@email.com"
                aria-label="Email address for newsletter"
                className="flex-1 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:bg-white/10"
              />
              <button
                type="submit"
                className="flex-shrink-0 bg-[#e63946] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90">
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} {siteConfig.author}. All rights
            reserved.
          </p>
          <p className="text-xs text-white/30">
            Powered by{' '}
            <Link
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noreferrer"
              className="underline transition-opacity hover:opacity-80">
              TMDB
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
