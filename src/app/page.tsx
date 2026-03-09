import Link from 'next/link';
import { siteConfig } from '@/configs/site';

const CTA_CLASS =
  'inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[oklch(0.55_0.22_25)] text-white text-lg font-bold shadow-[0_4px_24px_oklch(0.55_0.22_25/0.45)] transition-all hover:brightness-110 active:brightness-95';

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden={true}>
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[oklch(0.06_0_0)] font-sans text-[oklch(0.95_0_0)]">
      {/* Top bar */}
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[oklch(0.06_0_0)/80] px-6 py-4 backdrop-blur-md">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-[oklch(0.55_0.22_25)]">★</span>{' '}
          {siteConfig.name}
        </span>
        <Link
          href="/home"
          className="rounded-md bg-[oklch(0.55_0.22_25)] px-5 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 active:brightness-95">
          Open {siteConfig.name}
        </Link>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-16 pt-20 text-center">
        {/* Background glow */}
        <div
          aria-hidden={true}
          className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.55_0.22_25)/8%] blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[oklch(0.55_0.22_25)/40] bg-[oklch(0.55_0.22_25)/10] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[oklch(0.55_0.22_25)]">
            <span>★</span> Free Streaming
          </div>

          <h1 className="mb-6 text-5xl font-extrabold leading-tight sm:text-6xl md:text-7xl">
            Movies &amp; TV Shows
            <br />
            <span className="text-[oklch(0.55_0.22_25)]">On Demand.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-[oklch(0.65_0_0)] sm:text-xl">
            {siteConfig.description}
          </p>

          <Link href="/home" className={CTA_CLASS}>
            <PlayIcon />
            Open {siteConfig.name}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything you need to{' '}
            <span className="text-[oklch(0.55_0.22_25)]">watch</span>
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-3 rounded-xl border border-white/5 bg-[oklch(0.10_0_0)] p-6 transition-colors hover:border-[oklch(0.55_0.22_25)/40]">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[oklch(0.65_0_0)]">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[oklch(0.55_0.22_25)/30] bg-[oklch(0.10_0_0)] p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to start watching?</h2>
          <p className="mb-8 text-[oklch(0.65_0_0)]">
            Thousands of movies and TV shows are waiting for you — no sign-up
            required.
          </p>
          <Link href="/home" className={CTA_CLASS}>
            <PlayIcon />
            Open {siteConfig.name}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-xs text-[oklch(0.45_0_0)]">
        <p>
          © {new Date().getFullYear()} {siteConfig.name} — {siteConfig.slogan}
        </p>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: '🎬',
    title: 'Movies & TV Shows',
    description:
      'Browse thousands of movies and TV series across all genres — from blockbusters to hidden gems.',
  },
  {
    icon: '🔍',
    title: 'Powerful Search',
    description:
      'Find exactly what you want to watch with instant search across our full library.',
  },
  {
    icon: '📺',
    title: 'Any Device',
    description:
      'Watch on your smart TV, laptop, phone or tablet. Stream right from your browser.',
  },
  {
    icon: '⭐',
    title: 'Trending Content',
    description:
      "Stay up to date with what's trending and discover top-rated titles recommended for you.",
  },
  {
    icon: '📖',
    title: 'Watch History',
    description:
      'Pick up where you left off. Your watch history is saved so you never lose your place.',
  },
  {
    icon: '🚫',
    title: 'No Sign-Up Needed',
    description:
      'Jump straight in. No account, no subscription, no hassle — just hit play.',
  },
] as const;
