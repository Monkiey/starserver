'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { getMobileDetect, getYear } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { useModalStore } from '@/stores/modal';
import {
  type KeyWord,
  type ISeason,
  MediaType,
  type Genre,
  type ShowWithGenreAndVideo,
  type Show,
  type VideoResult,
} from '@/types';
import Link from 'next/link';
import * as React from 'react';
import Youtube from 'react-youtube';
import CustomImage from './custom-image';
import ShowWatchPicker from './show-watch-picker';
import { useContinueWatchingStore } from '@/stores/continue-watching';

type YouTubePlayer = {
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  seekTo: (value: number) => void;
  container: HTMLDivElement;
  internalPlayer: YouTubePlayer;
};

type YouTubeEvent = {
  target: YouTubePlayer;
};

const userAgent =
  typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
const { isMobile } = getMobileDetect(userAgent);
const defaultOptions: Record<string, object> = {
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    rel: 0,
    mute: isMobile() ? 1 : 0,
    loop: 1,
    autoplay: 1,
    controls: 0,
    showinfo: 0,
    disablekb: 1,
    enablejsapi: 1,
    playsinline: 1,
    cc_load_policy: 0,
    modestbranding: 3,
  },
};

const ShowModal = () => {
  // stores
  const modalStore = useModalStore();
  const IS_MOBILE: boolean = isMobile();

  const [trailer, setTrailer] = React.useState('');
  const isPlaying = true;
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [isAnime, setIsAnime] = React.useState<boolean>(false);
  const [seasons, setSeasons] = React.useState<ISeason[]>([]);
  const [isMuted, setIsMuted] = React.useState<boolean>(
    modalStore.firstLoad || IS_MOBILE,
  );
  const [options, setOptions] =
    React.useState<Record<string, object>>(defaultOptions);

  const youtubeRef = React.useRef(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const continueWatchingStore = useContinueWatchingStore();

  // get trailer and genres of show
  const handleGetData = React.useCallback(async () => {
    const id: number | undefined = modalStore.show?.id;
    const type: string =
      modalStore.show?.media_type === MediaType.TV ? 'tv' : 'movie';
    if (!id || !type) {
      return;
    }
    const data: ShowWithGenreAndVideo = await MovieService.findMovieByIdAndType(
      id,
      type,
    );

    const keywords: KeyWord[] =
      data?.keywords?.results || data?.keywords?.keywords;

    if (keywords?.length) {
      setIsAnime(
        !!keywords.find((keyword: KeyWord) => keyword.name === 'anime'),
      );
    }

    if (data?.genres) {
      setGenres(data.genres);
    }
    if (data.videos?.results?.length) {
      const videoData: VideoResult[] = data.videos?.results;
      const result: VideoResult | undefined = videoData.find(
        (item: VideoResult) => item.type === 'Trailer',
      );
      if (result?.key) setTrailer(result.key);
    }

    if (type === 'tv' && data?.seasons?.length) {
      const filteredSeasons = data.seasons.filter(
        (season: ISeason) => season.season_number,
      );
      const seasonRequests = await Promise.all(
        filteredSeasons.map((season: ISeason) =>
          MovieService.getSeasons(id, season.season_number),
        ),
      );
      setSeasons(seasonRequests.map((res) => res.data));
    } else {
      setSeasons([]);
    }
  }, [modalStore.show]);

  React.useEffect(() => {
    if (modalStore.firstLoad || IS_MOBILE) {
      setOptions((state: Record<string, object>) => ({
        ...state,
        playerVars: { ...state.playerVars, mute: 1 },
      }));
    }
    void handleGetData();
  }, [IS_MOBILE, handleGetData, modalStore.firstLoad]);

  React.useEffect(() => {
    setIsAnime(false);
  }, [modalStore]);

  const handleCloseModal = () => {
    modalStore.reset();
    if (!modalStore.show || modalStore.firstLoad) {
      window.history.pushState(null, '', '/');
    } else {
      window.history.back();
    }
  };

  const onEnd = (event: YouTubeEvent) => {
    event.target.seekTo(0);
  };

  const onPlay = () => {
    if (imageRef.current) {
      imageRef.current.style.opacity = '0';
    }
    if (youtubeRef.current) {
      const iframeRef: HTMLElement | null =
        document.getElementById('video-trailer');
      if (iframeRef) iframeRef.classList.remove('opacity-0');
    }
  };

  const onReady = (event: YouTubeEvent) => {
    event.target.playVideo();
  };

  const handleChangeMute = () => {
    setIsMuted((state: boolean) => !state);
    if (!youtubeRef.current) return;
    const videoRef: YouTubePlayer = youtubeRef.current as YouTubePlayer;
    if (isMuted && youtubeRef.current) {
      videoRef.internalPlayer.unMute();
    } else if (youtubeRef.current) {
      videoRef.internalPlayer.mute();
    }
  };

  const handleHref = (): string => {
    const type = isAnime
      ? 'anime'
      : modalStore.show?.media_type === MediaType.MOVIE
      ? 'movie'
      : 'tv';
    let id = `${modalStore.show?.id}`;
    if (isAnime) {
      const prefix: string =
        modalStore.show?.media_type === MediaType.MOVIE ? 'm' : 't';
      id = `${prefix}-${id}`;
    }
    return `/watch/${type}/${id}`;
  };

  const handleContinueWatching = (show: Show) => {
    continueWatchingStore.addItem(show);
  };

  return (
    <Dialog
      open={modalStore.open}
      onOpenChange={handleCloseModal}
      aria-label="Modal containing show's details">
      <DialogContent
        aria-describedby="show-details-description"
        hideCloseButton
        className="inset-0 h-full max-h-screen w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto border-none bg-background p-0 text-left shadow-none sm:rounded-none">
        <DialogTitle className="sr-only">Show details</DialogTitle>
        <DialogDescription id="show-details-description" className="sr-only">
          Details and playback options for the selected title.
        </DialogDescription>
        <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <div className="video-wrapper relative aspect-video overflow-hidden rounded-2xl border border-border/60">
            <CustomImage
              fill
              priority
              ref={imageRef}
              alt={modalStore?.show?.title ?? 'poster'}
              className="-z-40 z-[1] h-auto w-full object-cover"
              src={`https://image.tmdb.org/t/p/original${
                modalStore.show?.backdrop_path ?? modalStore.show?.poster_path
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 960px"
            />
            {trailer && (
              <Youtube
                opts={options}
                onEnd={onEnd}
                onPlay={onPlay}
                ref={youtubeRef}
                onReady={onReady}
                videoId={trailer}
                id="video-trailer"
                title={
                  modalStore.show?.title ??
                  modalStore.show?.name ??
                  'video-trailer'
                }
                className="relative aspect-video w-full"
                style={{ width: '100%', height: '100%' }}
                iframeClassName={`relative pointer-events-none w-[100%] h-[100%] z-[-10] opacity-0`}
              />
            )}
            <div className="absolute bottom-6 z-20 flex w-full items-center justify-between gap-2 px-10">
              <div className="flex items-center gap-2.5">
                <Link href={handleHref()}>
                  <Button
                    aria-label={`${isPlaying ? 'Pause' : 'Play'} show`}
                    className="group h-auto rounded py-1.5"
                    onClick={() => {
                      if (modalStore.show) {
                        handleContinueWatching(modalStore.show);
                      }
                    }}>
                    <>
                      <Icons.play
                        className="mr-1.5 h-6 w-6 fill-current"
                        aria-hidden="true"
                      />
                      Play
                    </>
                  </Button>
                </Link>
              </div>
              <Button
                aria-label={`${isMuted ? 'Unmute' : 'Mute'} video`}
                variant="ghost"
                className="h-auto rounded-full bg-neutral-800 p-1.5 opacity-50 ring-1 ring-slate-400 hover:bg-neutral-800 hover:opacity-100 hover:ring-white focus:ring-offset-0 dark:bg-neutral-800 dark:hover:bg-neutral-800"
                onClick={handleChangeMute}>
                {isMuted ? (
                  <Icons.volumeMute className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Icons.volume className="h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-foreground/80">
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
                  {modalStore.show?.title ?? modalStore.show?.name}
                </DialogTitle>
                <Button
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={handleCloseModal}>
                  Back to browse
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-primary">
                  {modalStore.show?.vote_average != null
                    ? `${Math.round(
                        (modalStore.show.vote_average / 10) * 100,
                      )}% Match`
                    : '-'}
                </span>
                {modalStore.show?.release_date ? (
                  <span>{getYear(modalStore.show?.release_date)}</span>
                ) : modalStore.show?.first_air_date ? (
                  <span>{getYear(modalStore.show?.first_air_date)}</span>
                ) : null}
                {modalStore.show?.original_language && (
                  <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs font-medium uppercase">
                    {modalStore.show.original_language}
                  </span>
                )}
              </div>
              <DialogDescription
                className="max-w-3xl text-xs text-foreground/80 sm:text-sm"
                id={undefined}>
                {modalStore.show?.overview ?? '-'}
              </DialogDescription>
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {modalStore.show && (
            <ShowWatchPicker
              show={modalStore.show}
              seasons={seasons}
              onPlay={handleContinueWatching}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShowModal;
