import { type Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { handleMetadata, getIdFromSlug, getNameFromShow } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { MediaType, type ISeason } from '@/types';
import SeasonPicker from '@/components/season-picker';

type Props = {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return handleMetadata(params.slug, 'tv-shows', 'tv');
}

export default async function TvShowDetailPage({ params }: Props) {
  const showId = getIdFromSlug(params.slug);

  if (!showId) {
    notFound();
  }

  const show = await MovieService.findMovieByIdAndType(showId, 'tv');

  if (!show) {
    notFound();
  }

  show.media_type = MediaType.TV;

  const availableSeasons =
    show.seasons?.filter((season) => season.season_number) ?? [];

  const seasonResponses = await Promise.all(
    availableSeasons.map((season) =>
      MovieService.getSeasons(showId, season.season_number),
    ),
  );

  const seasons: ISeason[] = seasonResponses
    .map((response) => response.data)
    .filter((season) => season.episodes?.length);

  const heroImage =
    show.backdrop_path ?? show.poster_path
      ? `https://image.tmdb.org/t/p/original${
          show.backdrop_path ?? show.poster_path
        }`
      : '/images/grey-thumbnail.jpg';

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-[4%] pb-16 pt-24 md:px-10 md:pt-32">
        <div className="grid gap-8 lg:grid-cols-[340px,1fr] lg:items-start">
          <div className="relative mx-auto h-[400px] w-full max-w-[340px] overflow-hidden rounded-[28px] border border-white/20 bg-white/10 shadow-[0_30px_120px_-80px_rgba(0,0,0,0.9)] backdrop-blur">
            <Image
              src={heroImage}
              alt={getNameFromShow(show)}
              fill
              priority
              sizes="(max-width: 768px) 70vw, 340px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="space-y-6 rounded-[28px] border border-white/10 bg-black/30 p-6 shadow-[0_30px_120px_-80px_rgba(0,0,0,0.8)] backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/80">
                Series
              </div>
              {show.genres?.length ? (
                <div className="flex flex-wrap gap-2 text-xs text-foreground/80">
                  {show.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-full border border-white/20 bg-white/5 px-3 py-1">
                      {genre.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
                {getNameFromShow(show)}
              </h1>
              {show.tagline ? (
                <p className="text-lg text-white/80">{show.tagline}</p>
              ) : null}
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm text-white/80 sm:grid-cols-3">
              <div className="border-white/15 rounded-2xl border bg-white/5 px-3 py-2 backdrop-blur">
                <dt className="text-[11px] uppercase tracking-[0.18em]">
                  First aired
                </dt>
                <dd className="font-semibold text-white">
                  {show.first_air_date ?? '-'}
                </dd>
              </div>
              <div className="border-white/15 rounded-2xl border bg-white/5 px-3 py-2 backdrop-blur">
                <dt className="text-[11px] uppercase tracking-[0.18em]">
                  Seasons
                </dt>
                <dd className="font-semibold text-white">
                  {show.number_of_seasons ?? '-'}
                </dd>
              </div>
              <div className="border-white/15 rounded-2xl border bg-white/5 px-3 py-2 backdrop-blur">
                <dt className="text-[11px] uppercase tracking-[0.18em]">
                  Episodes
                </dt>
                <dd className="font-semibold text-white">
                  {show.number_of_episodes ?? '-'}
                </dd>
              </div>
              <div className="border-white/15 rounded-2xl border bg-white/5 px-3 py-2 backdrop-blur">
                <dt className="text-[11px] uppercase tracking-[0.18em]">
                  Status
                </dt>
                <dd className="font-semibold text-white">
                  {show.status ?? '-'}
                </dd>
              </div>
              <div className="border-white/15 rounded-2xl border bg-white/5 px-3 py-2 backdrop-blur">
                <dt className="text-[11px] uppercase tracking-[0.18em]">
                  Language
                </dt>
                <dd className="font-semibold text-white">
                  {show.original_language?.toUpperCase() ?? '-'}
                </dd>
              </div>
              <div className="border-white/15 rounded-2xl border bg-white/5 px-3 py-2 backdrop-blur">
                <dt className="text-[11px] uppercase tracking-[0.18em]">
                  Score
                </dt>
                <dd className="font-semibold text-white">
                  {show.vote_average
                    ? `${show.vote_average.toFixed(1)} / 10`
                    : '-'}
                </dd>
              </div>
            </dl>

            {show.overview && (
              <div className="border-white/15 rounded-2xl border bg-white/5 p-4 text-sm text-white/80 shadow-inner backdrop-blur">
                {show.overview}
              </div>
            )}

            {show.videos?.results?.length ? (
              <div className="flex flex-wrap gap-3">
                <Link
                  prefetch={false}
                  className="bg-white/15 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20"
                  href={`https://www.youtube.com/watch?v=${show.videos.results[0].key}`}
                  target="_blank"
                  rel="noreferrer">
                  Trailer
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {seasons.length ? (
          <div className="bg-black/35 rounded-[28px] border border-white/10 p-6 shadow-[0_30px_120px_-80px_rgba(0,0,0,0.8)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Seasons & Episodes
                </p>
                <h2 className="text-xl font-semibold text-white">
                  Pick a season to start watching
                </h2>
              </div>
              <div className="h-px flex-1 bg-white/20" />
            </div>
            <SeasonPicker seasons={seasons} showId={show.id} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
