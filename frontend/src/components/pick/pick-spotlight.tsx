"use client";

import { type Ref, useEffect, useState } from "react";

import Link from "next/link";

import { ArrowRight, Clapperboard, Shuffle, Star } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { formatRuntime } from "@/components/movie-details/movie-details-hero";
import { buttonVariants } from "@/components/ui/button";
import { primaryActionClassName } from "@/components/ui/controls";
import { ResilientImage } from "@/components/ui/resilient-image";
import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import { cn } from "@/lib/utils";
import type { Genre } from "@/types/movie";

import type { PickedMovie } from "./use-pick";

type PickSpotlightProps = {
  picked: PickedMovie;
  genres: Genre[];
  /** Rendered invisibly while the search is still showing, so the artwork can load first. */
  hidden?: boolean;
  onArtworkReady?: () => void;
  /** The poster could not be loaded at all (the picker may choose another movie). */
  onPosterFailed?: () => void;
  headingRef?: Ref<HTMLHeadingElement>;
  isSaved: boolean;
  isUpdating: boolean;
  onToggleWatchlist: () => void;
  onPickAgain: () => void;
};

export const spotlightFrameClassName =
  "relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[#050d22] shadow-[0_40px_120px_rgb(0_0_0/45%)]";

/** Calls `onReady` once every given image has loaded or failed; missing images count as ready. */
function useArtworkReady(urls: Array<string | null>, onReady?: () => void) {
  const [settledUrls, setSettledUrls] = useState<string[]>([]);
  const isReady = urls.every((url) => !url || settledUrls.includes(url));

  useEffect(() => {
    if (isReady) {
      onReady?.();
    }
  }, [isReady, onReady]);

  return (url: string) => setSettledUrls((current) => (current.includes(url) ? current : [...current, url]));
}

const posterFallback = (title: string) => (
  <div className="flex size-full flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_50%_35%,rgb(20_157_236/28%),transparent_65%),linear-gradient(160deg,#0d2047,#071229_60%,#14102e)] px-5 text-center">
    <Clapperboard aria-hidden="true" className="size-10 text-white/55" />
    <span className="text-lg leading-tight font-extrabold tracking-[-0.02em] text-white/85 text-balance">{title}</span>
  </div>
);

export function PickSpotlight({
  genres,
  headingRef,
  hidden = false,
  isSaved,
  isUpdating,
  onArtworkReady,
  onPickAgain,
  onPosterFailed,
  onToggleWatchlist,
  picked,
}: PickSpotlightProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const { details, movie } = picked;
  // The summary backdrop is a light rendition (D029); it is blurred, so the full original is not needed.
  const backdropUrl = movie.backdropUrl ?? details?.backdropUrl ?? null;
  const posterUrl = movie.posterUrl;
  const settle = useArtworkReady([posterUrl, backdropUrl], onArtworkReady);
  const movieGenres = details?.genres ?? genres.filter((genre) => movie.genreIds.includes(genre.id));
  const neighbours = (details?.similarMovies ?? []).filter((similar) => similar.posterUrl).slice(0, 2);
  const year = movie.releaseDate?.slice(0, 4);
  const country = details?.productionCountryCodes[0];
  const director = details?.directors[0]?.name;
  const facts = [
    year ? (country ? `${year} (${country})` : year) : null,
    details && details.runtimeMinutes > 0 ? formatRuntime(details.runtimeMinutes) : null,
    director,
  ].filter(Boolean);
  const enter = (delay: number) =>
    reduceMotion || hidden
      ? {}
      : {
          animate: { filter: "blur(0px)", opacity: 1, y: 0 },
          initial: { filter: "blur(6px)", opacity: 0, y: 14 },
          transition: { delay, duration: 0.55, ease: [0.2, 0.65, 0.3, 0.9] as const },
        };

  return (
    <section
      aria-hidden={hidden || undefined}
      aria-labelledby={hidden ? undefined : "picked-heading"}
      className={cn(spotlightFrameClassName, hidden && "pointer-events-none invisible absolute inset-x-0 top-0")}
      inert={hidden || undefined}
    >
      {backdropUrl ? (
        <ResilientImage
          alt=""
          className="-z-20 scale-110 object-cover opacity-50 blur-2xl"
          fetchPriority="high"
          fill
          loading="eager"
          onFailed={() => settle(backdropUrl)}
          onLoad={() => settle(backdropUrl)}
          // Heavily blurred, so a small rendition is enough and loads fast.
          sizes="640px"
          src={backdropUrl}
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(3_10_27/35%),rgb(3_10_27/62%)_45%,#030a1b_100%),radial-gradient(ellipse_60%_40%_at_50%_35%,rgb(20_157_236/14%),transparent_70%)]"
      />

      <div className="flex flex-col items-center px-5 pt-10 pb-10 text-center sm:px-10 sm:pt-14 sm:pb-14">
        <motion.div {...enter(0)}>
          <h2
            className="text-3xl font-extrabold tracking-[-0.04em] text-white outline-none sm:text-4xl lg:text-5xl"
            id={hidden ? undefined : "picked-heading"}
            ref={hidden ? undefined : headingRef}
            tabIndex={-1}
          >
            Picked for you
          </h2>
          {movieGenres.length > 0 ? (
            <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 text-sm font-bold sm:text-base">
              {movieGenres.slice(0, 3).map((genre, index) => (
                <span className="flex items-center gap-2" key={genre.id}>
                  {index > 0 ? <span aria-hidden="true" className="text-white/40">·</span> : null}
                  <Link
                    className="inline-flex min-h-11 items-center rounded px-1 text-[#f5a9d1] underline decoration-[#e84c9d]/70 decoration-dotted underline-offset-4 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring"
                    href={`/?genre=${genre.id}`}
                  >
                    {genre.name}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </motion.div>

        <motion.div className="relative mt-6 w-48 sm:mt-8 sm:w-60 lg:w-72" {...enter(0.12)}>
          {neighbours.map((neighbour, index) => (
            <div
              aria-hidden="true"
              className={cn(
                "absolute top-[6%] aspect-[2/3] h-[76%] overflow-hidden rounded-2xl opacity-45 blur-[3px]",
                index === 0 ? "right-[calc(100%+1rem)] sm:right-[calc(100%+2rem)]" : "left-[calc(100%+1rem)] sm:left-[calc(100%+2rem)]",
              )}
              key={neighbour.id}
            >
              <ResilientImage alt="" className="object-cover" fill sizes="200px" src={neighbour.posterUrl!} />
            </div>
          ))}
          {/* Ticket: the poster, a perforated tear line with side notches, and a stub with the score. */}
          <div className="drop-shadow-[0_30px_40px_rgb(0_0_0/55%)]">
            <div className="pick-poster-ticket relative overflow-hidden rounded-[1.4rem] bg-[#0b1733]">
              <div className="relative aspect-[2/3] bg-white/8">
                {posterUrl ? (
                  <ResilientImage
                    alt={`${movie.title} poster`}
                    className="object-cover"
                    fallback={posterFallback(movie.title)}
                    fetchPriority="high"
                    fill
                    loading="eager"
                    // While hidden, a poster that cannot load lets the picker choose another movie first.
                    onFailed={() => (onPosterFailed ? onPosterFailed() : settle(posterUrl))}
                    onLoad={() => settle(posterUrl)}
                    sizes="(max-width: 639px) 192px, (max-width: 1023px) 240px, 288px"
                    src={posterUrl}
                  />
                ) : (
                  posterFallback(movie.title)
                )}
              </div>
              <div className="relative flex h-14 items-center justify-between gap-3 px-5 sm:h-16 sm:px-6">
                <span aria-hidden="true" className="absolute inset-x-5 top-0 border-t-2 border-dashed border-white/18" />
                <span className="text-[0.6875rem] font-bold tracking-[0.2em] whitespace-nowrap text-white/55 uppercase sm:text-xs">
                  TMDB<span className="hidden sm:inline"> score</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#1f9d55] px-2.5 py-1 text-sm font-extrabold text-white sm:text-base">
                  <Star aria-hidden="true" className="size-3.5 fill-current sm:size-4" />
                  <span className="sr-only">Rated </span>
                  {movie.voteAverage.toFixed(1)}
                  <span className="sr-only"> out of 10</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="mt-7 flex w-full flex-col items-center" {...enter(0.24)}>
          <h3 className="max-w-3xl text-3xl font-extrabold tracking-[-0.04em] text-balance text-white sm:text-4xl">{movie.title}</h3>
          {facts.length > 0 ? <p className="mt-2 text-sm font-semibold text-white/68 sm:text-base">{facts.join(" · ")}</p> : null}

          <div className="mt-7 flex w-full max-w-md flex-col gap-3">
            <Link
              className={cn(buttonVariants({ size: "lg" }), primaryActionClassName, "min-h-14 w-full text-base")}
              href={`/movies/${movie.id}`}
            >
              View Details
              <ArrowRight aria-hidden="true" />
            </Link>
            <div className="flex flex-col gap-3 sm:flex-row">
              <WatchlistButton
                appearance="details"
                className="flex-1"
                isSaved={isSaved}
                isUpdating={isUpdating}
                onToggle={onToggleWatchlist}
                title={movie.title}
              />
              <button
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/6 px-5 text-sm font-semibold text-white backdrop-blur-md transition-colors outline-none hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
                onClick={onPickAgain}
                type="button"
              >
                <Shuffle aria-hidden="true" className="size-4" />
                Pick again
              </button>
            </div>
          </div>
        </motion.div>

        {movie.overview ? (
          <motion.p
            className="mt-9 max-w-2xl border-t border-white/10 pt-7 text-sm leading-7 text-white/72 sm:text-base"
            {...enter(0.34)}
          >
            {movie.overview}
          </motion.p>
        ) : null}
      </div>
    </section>
  );
}
