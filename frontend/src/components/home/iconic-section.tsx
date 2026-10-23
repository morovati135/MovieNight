"use client";

import { useEffect, useRef, useState } from "react";

import { sectionTitleClassName } from "@/components/layout/section-heading";
import { MovieRow } from "@/components/movie/movie-row";
import { getTopRatedMovies } from "@/lib/api/movies";
import type { MovieSummary } from "@/types/movie";

import { SectionNotice } from "./home-states";
import { useNearViewport } from "./use-near-viewport";

type IconicState = { status: "loading" } | { status: "error" } | { status: "ready"; movies: MovieSummary[] };

const title = "Iconic: Top rated of all time";

type IconicSectionProps = {
  savedMovieIds: Set<number>;
  updatingMovieIds: Set<number>;
  onWatchlistToggle: (movie: MovieSummary) => void;
};

/** The highest rated films that very many people have rated, as landscape cards (`movie-covers/Cards`). */
export function IconicSection({ onWatchlistToggle, savedMovieIds, updatingMovieIds }: IconicSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isNear = useNearViewport(sectionRef);
  const [state, setState] = useState<IconicState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isNear) {
      return;
    }

    let isCurrent = true;

    getTopRatedMovies()
      .then((page) => isCurrent && setState({ movies: page.results, status: "ready" }))
      .catch(() => isCurrent && setState({ status: "error" }));

    return () => {
      isCurrent = false;
    };
  }, [attempt, isNear]);

  if (state.status === "ready") {
    return state.movies.length > 0 ? (
      <MovieRow
        cardVariant="landscape"
        moreHref="/browse/iconic"
        moreLabel="See more"
        movies={state.movies}
        onWatchlistToggle={onWatchlistToggle}
        savedMovieIds={savedMovieIds}
        title={title}
        updatingMovieIds={updatingMovieIds}
      />
    ) : null;
  }

  return (
    <section aria-busy={state.status === "loading"} aria-labelledby="iconic-heading" ref={sectionRef}>
      <div className="mb-4 flex min-h-11 items-center sm:mb-7">
        <h2 className={sectionTitleClassName} id="iconic-heading">
          {title}
        </h2>
      </div>
      {state.status === "error" ? (
        <SectionNotice
          onAction={() => {
            setState({ status: "loading" });
            setAttempt((current) => current + 1);
          }}
        >
          Top rated movies could not be loaded right now.
        </SectionNotice>
      ) : (
        <div aria-hidden="true" className="grid auto-cols-[15rem] grid-flow-col gap-3.5 overflow-hidden pb-12 sm:auto-cols-[18rem] sm:gap-5 lg:auto-cols-[22rem] lg:gap-8">
          {Array.from({ length: 5 }, (_, index) => (
            <div className="aspect-[16/10] rounded-2xl bg-white/7 motion-safe:animate-pulse" key={index} />
          ))}
        </div>
      )}
    </section>
  );
}
