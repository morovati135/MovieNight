"use client";

import { useId, useRef } from "react";

import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { sectionTitleClassName } from "@/components/layout/section-heading";
import { glassControlClassName, inlineLinkClassName } from "@/components/ui/controls";
import { cn } from "@/lib/utils";
import type { MovieSummary } from "@/types/movie";

import { MovieCard } from "./movie-card";
import { useRailScroll } from "./use-rail-scroll";

type MovieRowProps = {
  title: string;
  movies: MovieSummary[];
  savedMovieIds: Set<number>;
  updatingMovieIds: Set<number>;
  onWatchlistToggle: (movie: MovieSummary) => void;
  headingMode?: "visible" | "sr-only";
  moreHref?: string;
  moreLabel?: string;
  cardVariant?: "poster" | "landscape";
};

export function MovieRow({
  cardVariant = "poster",
  movies,
  headingMode = "visible",
  moreHref,
  moreLabel = "View all",
  onWatchlistToggle,
  savedMovieIds,
  title,
  updatingMovieIds,
}: MovieRowProps) {
  const railId = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const controlLabel = title.replace(/ (Now|Movies)$/i, "");
  const { canScrollNext, canScrollPrevious, scrollRail, updateScrollState } = useRailScroll(railRef, movies.length);

  return (
    <section aria-labelledby={`${railId}-heading`} className="movie-rail-section relative isolate">
      <div
        className={
          headingMode === "visible"
            ? "relative z-10 mb-4 flex min-h-11 items-center justify-between gap-5 sm:mb-7"
            : "sr-only"
        }
      >
        <h2 className={sectionTitleClassName} id={`${railId}-heading`}>
          {title}
        </h2>
        {moreHref ? (
          <Link className={inlineLinkClassName} href={moreHref}>
            {moreLabel}
            <ChevronRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 motion-safe:group-hover/more:translate-x-0.5"
            />
          </Link>
        ) : headingMode === "sr-only" ? null : (
          <button
            aria-controls={railId}
            aria-label={`Show more ${controlLabel} movies`}
            className={cn(inlineLinkClassName, "md:hidden disabled:pointer-events-none disabled:opacity-0")}
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
        )}
      </div>

      <div className="relative z-10">
        <div
          aria-label={`${controlLabel} movies`}
          className={cn(
            "-mx-5 overflow-x-auto overscroll-x-contain pb-5 outline-none [scroll-padding-inline-start:1.25rem] [scrollbar-width:none] [scroll-snap-type:x_proximity] [touch-action:pan-x_pan-y] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring sm:-mx-8 sm:[scroll-padding-inline-start:2rem] lg:mx-0 lg:[scroll-padding-inline-start:0] [&::-webkit-scrollbar]:hidden",
            // Landscape cards cast a longer shadow; extra bottom room keeps it soft instead of clipped.
            cardVariant === "landscape" && "-mb-7 pb-12",
          )}
          id={railId}
          onScroll={updateScrollState}
          ref={railRef}
          role="region"
          tabIndex={0}
        >
          <div
            className={cn(
              "grid w-max grid-flow-col gap-3.5 px-5 sm:gap-5 sm:px-8 lg:gap-8 lg:px-0",
              cardVariant === "landscape"
                ? "auto-cols-[15rem] sm:auto-cols-[18rem] lg:auto-cols-[22rem]"
                : "auto-cols-[7.5rem] sm:auto-cols-[10.5rem] lg:auto-cols-[13rem]",
            )}
          >
            {movies.map((movie) => (
              <MovieCard
                isSaved={savedMovieIds.has(movie.id)}
                isUpdating={updatingMovieIds.has(movie.id)}
                key={movie.id}
                movie={movie}
                onWatchlistToggle={onWatchlistToggle}
                variant={cardVariant}
              />
            ))}
          </div>
        </div>

        <button
          aria-controls={railId}
          aria-label={`Previous ${controlLabel} movies`}
          className={cn(
            glassControlClassName,
            "absolute top-[calc(50%_-_0.625rem)] left-1 z-20 hidden size-10 -translate-y-1/2 shadow-[0_10px_28px_rgb(0_0_0/32%)] md:flex lg:-left-5 lg:size-11",
          )}
          disabled={!canScrollPrevious}
          onClick={() => scrollRail(-1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>
        <button
          aria-controls={railId}
          aria-label={`Next ${controlLabel} movies`}
          className={cn(
            glassControlClassName,
            "absolute top-[calc(50%_-_0.625rem)] right-1 z-20 hidden size-10 -translate-y-1/2 shadow-[0_10px_28px_rgb(0_0_0/32%)] md:flex lg:-right-5 lg:size-11",
          )}
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
