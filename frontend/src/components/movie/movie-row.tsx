"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { MovieSummary } from "@/types/movie";

import { MovieCard } from "./movie-card";

type MovieRowProps = {
  title: string;
  movies: MovieSummary[];
  savedMovieIds: Set<number>;
  updatingMovieIds: Set<number>;
  onWatchlistToggle: (movie: MovieSummary) => void;
};

export function MovieRow({
  movies,
  onWatchlistToggle,
  savedMovieIds,
  title,
  updatingMovieIds,
}: MovieRowProps) {
  const railId = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const controlLabel = title.replace(/ (Now|Movies)$/, "");

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const maximumScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const edgeTolerance = 2;

    setCanScrollPrevious(rail.scrollLeft > edgeTolerance);
    setCanScrollNext(rail.scrollLeft < maximumScroll - edgeTolerance);
  }, []);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const frame = window.requestAnimationFrame(updateScrollState);
    const resizeObserver = new ResizeObserver(updateScrollState);

    resizeObserver.observe(rail);

    if (rail.firstElementChild) {
      resizeObserver.observe(rail.firstElementChild);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [movies.length, updateScrollState]);

  const scrollRail = (direction: -1 | 1) => {
    const rail = railRef.current;
    const track = rail?.firstElementChild;

    if (!rail || !(track instanceof HTMLElement)) {
      return;
    }

    const firstCard = track.children.item(0);
    const secondCard = track.children.item(1);
    let scrollDistance = rail.clientWidth * 0.78;

    if (firstCard instanceof HTMLElement && secondCard instanceof HTMLElement) {
      const cardStep = secondCard.offsetLeft - firstCard.offsetLeft;
      const visibleCardCount = Math.max(1, Math.floor(rail.clientWidth / cardStep));

      scrollDistance = cardStep * Math.max(1, visibleCardCount - 1);
    }

    rail.scrollBy({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      left: direction * scrollDistance,
    });
  };

  return (
    <section aria-labelledby={`${railId}-heading`} className="movie-rail-section relative isolate">
      <div className="relative z-10 mb-4 flex items-center justify-between gap-5 sm:mb-7">
        <h2
          className="text-2xl font-extrabold tracking-[-0.035em] text-white sm:text-3xl lg:text-5xl"
          id={`${railId}-heading`}
        >
          {title}
        </h2>
        <button
          aria-controls={railId}
          aria-label={`Show more ${controlLabel} movies`}
          className="group/more flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-1 text-sm font-semibold text-[#21aaf5] outline-none transition-colors hover:text-[#67c9ff] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-default disabled:opacity-40 md:hidden"
          disabled={!canScrollNext}
          onClick={() => scrollRail(1)}
          type="button"
        >
          See More
          <ChevronRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 motion-safe:group-hover/more:translate-x-0.5"
          />
        </button>
      </div>

      <div className="relative z-10">
        <div
          aria-label={`${title} movies`}
          className="-mx-5 overflow-x-auto overscroll-x-contain pb-5 outline-none [scroll-padding-inline-start:1.25rem] [scrollbar-width:none] [scroll-snap-type:x_proximity] [touch-action:pan-x_pan-y] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:-mx-8 sm:[scroll-padding-inline-start:2rem] lg:mx-0 lg:[scroll-padding-inline-start:0] [&::-webkit-scrollbar]:hidden"
          id={railId}
          onScroll={updateScrollState}
          ref={railRef}
          role="region"
          tabIndex={0}
        >
          <div className="grid w-max auto-cols-[7.5rem] grid-flow-col gap-3.5 px-5 sm:auto-cols-[10.5rem] sm:gap-5 sm:px-8 lg:auto-cols-[13rem] lg:gap-8 lg:px-0">
            {movies.map((movie) => (
              <MovieCard
                isSaved={savedMovieIds.has(movie.id)}
                isUpdating={updatingMovieIds.has(movie.id)}
                key={movie.id}
                movie={movie}
                onWatchlistToggle={onWatchlistToggle}
              />
            ))}
          </div>
        </div>

        <button
          aria-controls={railId}
          aria-label={`Previous ${controlLabel} movies`}
          className="absolute top-[calc(50%_-_0.625rem)] left-1 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-[#061126]/76 text-white/85 shadow-[0_10px_28px_rgb(0_0_0/32%)] outline-none backdrop-blur-md transition-[background-color,border-color,color,opacity] hover:border-white/30 hover:bg-[#0b1a34]/92 hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-default disabled:opacity-20 disabled:hover:border-white/14 disabled:hover:bg-[#061126]/76 disabled:hover:text-white/85 md:flex lg:-left-5"
          disabled={!canScrollPrevious}
          onClick={() => scrollRail(-1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>
        <button
          aria-controls={railId}
          aria-label={`Next ${controlLabel} movies`}
          className="absolute top-[calc(50%_-_0.625rem)] right-1 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-[#061126]/76 text-white/85 shadow-[0_10px_28px_rgb(0_0_0/32%)] outline-none backdrop-blur-md transition-[background-color,border-color,color,opacity] hover:border-white/30 hover:bg-[#0b1a34]/92 hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-default disabled:opacity-20 disabled:hover:border-white/14 disabled:hover:bg-[#061126]/76 disabled:hover:text-white/85 md:flex lg:-right-5"
          disabled={!canScrollNext}
          onClick={() => scrollRail(1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" className="size-5" />
        </button>
      </div>
    </section>
  );
}
