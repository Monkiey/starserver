import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { siteConfig } from '@/configs/site';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Index() {
  return (
    <>
      <section
        id="hero"
        aria-labelledby="hero-heading"
        className="container mx-auto flex flex-col gap-10 pb-10 pt-28 md:pb-16 lg:pt-32">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-background via-background to-secondary/10 p-8 shadow-lg md:p-12">
          <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-secondary/40 blur-3xl" />
          <div className="relative grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-6">
              <Link
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noreferrer"
                className="inline-flex">
                <Badge
                  aria-hidden="true"
                  className="rounded-full px-4 py-1.5 text-xs"
                  variant="secondary">
                  <Icons.twitter className="mr-2 h-3.5 w-3.5" />
                  Follow along on Twitter
                </Badge>
                <span className="sr-only">Twitter</span>
              </Link>
              <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
                {siteConfig.name} brings a cinematic world to your fingertips.
              </h1>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-lg sm:leading-8">
                Discover new releases, trending hits, and curated collections
                that match your mood. Everything is crafted with a smooth,
                rounded interface that keeps the focus on the story.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  className={`${buttonVariants({ size: 'lg' })} rounded-full`}
                  href="/home">
                  Watch Now <ArrowRight className="ml-1 inline-block" />
                </Link>
                <Link
                  className={`${buttonVariants({
                    size: 'lg',
                    variant: 'outline',
                  })} rounded-full`}
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer">
                  Explore the Build
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Curated Picks',
                  copy: 'Hand-selected collections that update daily.',
                },
                {
                  title: 'Ultra HD',
                  copy: 'Stream in 4K with adaptive performance.',
                },
                {
                  title: 'Zero Ads',
                  copy: 'Stay immersed with uninterrupted playback.',
                },
                {
                  title: 'Smart Devices',
                  copy: 'Continue watching on any screen.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur">
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="container space-y-10 pb-16">
        <div className="mx-auto flex max-w-[62rem] flex-col items-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-4xl md:text-5xl">
            Stream smarter with rounded comfort.
          </h2>
          <p className="max-w-[85%] text-base leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            {siteConfig.name} pairs a premium browsing experience with features
            designed for discovery, speed, and seamless playback.
          </p>
        </div>
        <div className="mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Vast Movie Library',
              copy: 'Thousands of titles spanning genres, languages, and decades.',
            },
            {
              title: 'Personalized Recommendations',
              copy: 'Smart suggestions tailored to every mood and watch history.',
            },
            {
              title: 'Multi-Device Support',
              copy: 'Pick up where you left off on any screen.',
            },
            {
              title: 'Watch Parties',
              copy: 'Sync with friends and react together in real time.',
            },
            {
              title: 'High-Definition Streaming',
              copy: 'Crisp 4K, HDR, and surround-ready playback.',
            },
            {
              title: 'Always Free',
              copy: 'Enjoy full access with no subscriptions required.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-[2rem] border border-border/60 bg-background/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.copy}
              </p>
            </div>
          ))}
        </div>
        {/* <div className="mx-auto text-center md:max-w-[58rem]"> */}
        {/*   <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7"> */}
        {/*     Taxonomy also includes a blog and a full-featured documentation site */}
        {/*   </p> */}
        {/* </div> */}
      </section>
    </>
  );
}
