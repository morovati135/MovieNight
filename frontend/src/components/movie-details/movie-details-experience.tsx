"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ChevronLeft, RotateCcw } from "lucide-react";

import { PageNotice } from "@/components/home/home-states";
import { sectionTitleClassName } from "@/components/layout/section-title";
import { MovieRow } from "@/components/movie/movie-row";
import { Button, buttonVariants } from "@/components/ui/button";
import { primaryActionClassName } from "@/components/ui/controls";
import { useWatchlist } from "@/components/watchlist/use-watchlist";
import { getMovieDetails, MovieNotFoundError } from "@/lib/api/movies";
import { cn } from "@/lib/utils";
import type { MovieDetails, MovieSummary } from "@/types/movie";

import { CastRail } from "./cast-rail";
import { MovieDetailsHero } from "./movie-details-hero";
import { PersonPortrait } from "./person-portrait";
import { SceneGallery } from "./scene-gallery";

type MovieDetailsState = { movieId: number; attempt: number } & (
  | { status: "error" }
  | { status: "not-found" }
  | { status: "ready"; movie: MovieDetails }
);

const subsectionTitleClassName = "text-xl font-extrabold tracking-[-0.03em] text-white sm:text-2xl lg:text-3xl";
const skeletonBlockClassName = "rounded-xl bg-white/9 motion-safe:animate-pulse";

function toSummary(movie: MovieDetails): MovieSummary {
  return {
    genreIds: movie.genres.map((genre) => genre.id),
    id: movie.id,
    overview: movie.overview,
    posterUrl: movie.posterUrl,
    releaseDate: movie.releaseDate,
    title: movie.title,
    voteAverage: movie.voteAverage,
  };
}

/** Mirrors the hero (poster, title, metadata, action) and the About section so the page does not jump. */
function MovieDetailsLoading() {
  return (
    <div aria-busy="true" role="status">
      <div aria-hidden="true" className="relative isolate overflow-hidden bg-background">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_68%_35%,rgb(28_52_79/52%),transparent_48%)] motion-safe:animate-pulse" />
        <div className="flex min-h-[33rem] items-end px-5 pt-32 pb-8 sm:min-h-[38rem] sm:px-8 sm:pb-12 md:min-h-[42rem] lg:min-h-[46rem] lg:px-12 lg:pb-16 xl:min-h-[min(100svh,52rem)]">
          <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-end sm:gap-7 lg:gap-9">
            <div className={cn(skeletonBlockClassName, "aspect-[2/3] w-28 bg-white/6 sm:w-40 md:w-44 lg:w-52")} />
            <div className="w-full max-w-xl space-y-4 sm:space-y-5">
              <div className={cn(skeletonBlockClassName, "h-12 w-4/5 sm:h-14")} />
              <div className={cn(skeletonBlockClassName, "h-4 w-1/2 rounded bg-white/7")} />
              <div className={cn(skeletonBlockClassName, "h-12 w-48 rounded-full")} />
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="space-y-4 px-5 pt-10 sm:px-8 sm:pt-14 lg:px-12 lg:pt-16">
        <div className={cn(skeletonBlockClassName, "h-9 w-64 lg:h-12 lg:w-96")} />
        <div className={cn(skeletonBlockClassName, "h-4 w-full max-w-4xl rounded bg-white/6")} />
        <div className={cn(skeletonBlockClassName, "h-4 w-11/12 max-w-4xl rounded bg-white/6")} />
        <div className={cn(skeletonBlockClassName, "h-4 w-2/3 max-w-4xl rounded bg-white/6")} />
      </div>
      <span className="sr-only">Loading movie details…</span>
    </div>
  );
}

const backToDiscover = (
  <Link className={cn(buttonVariants({ size: "lg" }), primaryActionClassName)} href="/">
    <ChevronLeft aria-hidden="true" />
    Back to Discover
  </Link>
);

export function MovieDetailsExperience({ movieId }: { movieId: number | null }) {
  const [details, setDetails] = useState<MovieDetailsState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const { savedMovieIds, statusMessage, toggle, updatingMovieIds } = useWatchlist();

  useEffect(() => {
    if (movieId === null) {
      return;
    }

    let isCurrent = true;

    getMovieDetails(movieId)
      .then((movie) => {
        if (isCurrent) {
          setDetails({ attempt, movie, movieId, status: "ready" });
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setDetails({ attempt, movieId, status: error instanceof MovieNotFoundError ? "not-found" : "error" });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt, movieId]);

  // Details for another movie or an older attempt are never shown; until the current ones arrive, the page is loading.
  const current = details?.movieId === movieId && details.attempt === attempt ? details : null;
  const title =
    current?.status === "ready"
      ? current.movie.title
      : movieId === null || current?.status === "not-found"
        ? "Movie not found"
        : current?.status === "error"
          ? "Movie unavailable"
          : null;

  useEffect(() => {
    if (!title) {
      return;
    }

    const previousTitle = document.title;
    document.title = `${title} · MovieNight`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  if (movieId === null || current?.status === "not-found") {
    return (
      <PageNotice action={backToDiscover} role="status" title="We couldn’t find that movie.">
        It may have been removed, or the link is incorrect.
      </PageNotice>
    );
  }

  if (current?.status === "error") {
    return (
      <PageNotice
        action={
          <Button className={primaryActionClassName} onClick={() => setAttempt((previous) => previous + 1)} type="button">
            <RotateCcw aria-hidden="true" />
            Try again
          </Button>
        }
        role="alert"
        title="We couldn’t load this movie right now."
      >
        The cinema is taking an intermission. Try again in a moment.
      </PageNotice>
    );
  }

  if (!current) {
    return <MovieDetailsLoading />;
  }

  const { movie } = current;

  return (
    <>
      <MovieDetailsHero
        isSaved={savedMovieIds.has(movie.id)}
        isUpdating={updatingMovieIds.has(movie.id)}
        movie={movie}
        onWatchlistToggle={() => void toggle(toSummary(movie))}
      />

      <div className="flex w-full flex-col gap-10 overflow-x-clip px-5 pt-10 pb-12 sm:gap-14 sm:px-8 sm:pt-14 sm:pb-20 lg:gap-16 lg:px-12 lg:pt-16 lg:pb-24">
        {movie.sceneImageUrls.length > 0 ? <SceneGallery imageUrls={movie.sceneImageUrls} title={movie.title} /> : null}

        <section aria-labelledby="movie-about-heading" className="max-w-5xl space-y-4 sm:space-y-5">
          <h2 className={sectionTitleClassName} id="movie-about-heading">
            About {movie.title}
          </h2>
          <p className="text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
            {movie.overview?.trim() || "No overview is available for this movie yet."}
          </p>
        </section>

        {movie.genres.length > 0 ? (
          <section aria-labelledby="movie-genres-heading" className="space-y-4 sm:space-y-5">
            <h2 className={subsectionTitleClassName} id="movie-genres-heading">
              Genres
            </h2>
            <ul className="flex flex-wrap gap-2.5 sm:gap-3">
              {movie.genres.map((genre) => (
                <li key={genre.id}>
                  {/* Opens the Home Search view browsing this genre (Sprint 05.3). */}
                  <Link
                    aria-label={`Browse ${genre.name} movies`}
                    className="inline-flex min-h-11 items-center rounded-full bg-brand-pink px-5 text-sm font-semibold text-white shadow-[0_10px_28px_rgb(232_76_157/18%)] outline-none transition-[filter,box-shadow] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6"
                    href={`/?genre=${genre.id}`}
                  >
                    {genre.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {movie.cast.length > 0 ? <CastRail cast={movie.cast} titleClassName={subsectionTitleClassName} /> : null}

        {movie.directors.length > 0 ? (
          <section aria-labelledby="movie-directors-heading">
            <h2 className={cn(subsectionTitleClassName, "mb-4 sm:mb-6")} id="movie-directors-heading">
              {movie.directors.length > 1 ? "Directors" : "Director"}
            </h2>
            <ul className="flex flex-wrap gap-4 sm:gap-6 lg:gap-8">
              {movie.directors.map((director) => (
                <li className="w-24 sm:w-28 lg:w-[7.5rem]" key={director.id}>
                  <PersonPortrait name={director.name} profileUrl={director.profileUrl} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {movie.similarMovies.length > 0 ? (
          <MovieRow
            movies={movie.similarMovies}
            onWatchlistToggle={(similarMovie) => void toggle(similarMovie)}
            savedMovieIds={savedMovieIds}
            title={`More like ${movie.title}`}
            updatingMovieIds={updatingMovieIds}
          />
        ) : null}
      </div>

      <p aria-live="polite" className="sr-only" role="status">
        {statusMessage}
      </p>
    </>
  );
}
