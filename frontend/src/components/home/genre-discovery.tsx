"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { GenreChips } from "@/components/movie/genre-chips";
import { MovieRow } from "@/components/movie/movie-row";
import { discoverMoviesByGenre, getGenres } from "@/lib/api/movies";
import type { Genre, MovieSummary } from "@/types/movie";

type GenreListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; genres: Genre[] };

type GenreResults = { genreId: number; movies: MovieSummary[] };

type GenreResultsState =
  | { status: "loading"; genreId: number; previous: GenreResults | null }
  | { status: "error"; genreId: number }
  | ({ status: "ready" } & GenreResults);

type GenreDiscoveryProps = {
  savedMovieIds: Set<number>;
  updatingMovieIds: Set<number>;
  onWatchlistToggle: (movie: MovieSummary) => void;
};

const retryButtonClassName =
  "min-h-11 rounded-lg px-2 font-bold text-[#41bfff] outline-none hover:text-[#72d1ff] focus-visible:ring-2 focus-visible:ring-ring";

export function GenreDiscovery({
  onWatchlistToggle,
  savedMovieIds,
  updatingMovieIds,
}: GenreDiscoveryProps) {
  const [genreList, setGenreList] = useState<GenreListState>({ status: "loading" });
  const [genreListRequest, setGenreListRequest] = useState(0);
  const [results, setResults] = useState<GenreResultsState | null>(null);
  const resultsRequestIdRef = useRef(0);

  const loadGenreMovies = useCallback(async (genreId: number) => {
    const requestId = resultsRequestIdRef.current + 1;
    resultsRequestIdRef.current = requestId;
    setResults((current) => ({
      genreId,
      previous:
        current?.status === "ready"
          ? { genreId: current.genreId, movies: current.movies }
          : current?.status === "loading"
            ? current.previous
            : null,
      status: "loading",
    }));

    try {
      const result = await discoverMoviesByGenre(genreId);

      if (resultsRequestIdRef.current === requestId) {
        setResults({ genreId, movies: result.results, status: "ready" });
      }
    } catch {
      if (resultsRequestIdRef.current === requestId) {
        setResults({ genreId, status: "error" });
      }
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    getGenres()
      .then((genres) => {
        if (!isCurrent) {
          return;
        }

        setGenreList({ genres, status: "ready" });

        if (genres[0]) {
          void loadGenreMovies(genres[0].id);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setGenreList({ status: "error" });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [genreListRequest, loadGenreMovies]);

  if (genreList.status === "ready" && genreList.genres.length === 0) {
    return null;
  }

  const genreName = (genreId: number) =>
    genreList.status === "ready"
      ? (genreList.genres.find((genre) => genre.id === genreId)?.name ?? "Selected genre")
      : "Selected genre";

  const handleGenreSelect = (genreId: number) => {
    if (results?.genreId === genreId && results.status !== "error") {
      return;
    }

    void loadGenreMovies(genreId);
  };

  const handleGenreListRetry = () => {
    setGenreList({ status: "loading" });
    setGenreListRequest((current) => current + 1);
  };

  const shownResults =
    results?.status === "ready" ? results : results?.status === "loading" ? results.previous : null;

  return (
    <section
      aria-busy={genreList.status === "loading" || results?.status === "loading"}
      aria-labelledby="genre-discovery-heading"
      className="relative isolate pt-14 sm:pt-8 lg:pt-6"
    >
      <div className="relative z-10 mb-5 flex items-center justify-between sm:mb-7">
        <h2
          className="text-2xl font-extrabold tracking-[-0.035em] text-white sm:text-3xl lg:text-5xl"
          id="genre-discovery-heading"
        >
          Discover by Genre
        </h2>
      </div>

      {genreList.status === "loading" ? (
        <>
          <div aria-hidden="true" className="flex gap-2.5 overflow-hidden py-1 sm:gap-3 md:px-14">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="h-11 w-24 shrink-0 animate-pulse rounded-full bg-white/[0.06]" key={index} />
            ))}
          </div>
          <div className="mt-7 sm:mt-9">
            <PosterRowSkeleton />
          </div>
          <span className="sr-only" role="status">
            Loading genres…
          </span>
        </>
      ) : null}

      {genreList.status === "error" ? (
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/72" role="alert">
          <span>Genres could not be loaded right now.</span>
          <button className={retryButtonClassName} onClick={handleGenreListRetry} type="button">
            Try again
          </button>
        </div>
      ) : null}

      {genreList.status === "ready" && results ? (
        <>
          <GenreChips
            genres={genreList.genres}
            onSelect={handleGenreSelect}
            selectedGenreId={results.genreId}
          />
          <div className="relative mt-7 sm:mt-9">
            {shownResults ? (
              <div
                className={
                  results.status === "loading"
                    ? "pointer-events-none opacity-45 transition-opacity duration-200"
                    : "opacity-100 transition-opacity duration-200"
                }
                inert={results.status === "loading"}
              >
                {shownResults.movies.length > 0 ? (
                  <MovieRow
                    headingMode="sr-only"
                    movies={shownResults.movies}
                    onWatchlistToggle={onWatchlistToggle}
                    savedMovieIds={savedMovieIds}
                    title={`${genreName(shownResults.genreId)} movies`}
                    updatingMovieIds={updatingMovieIds}
                  />
                ) : (
                  <p className="py-10 text-sm text-white/64">
                    No {genreName(shownResults.genreId)} movies to show right now.
                  </p>
                )}
              </div>
            ) : null}

            {results.status === "loading" && !shownResults ? <PosterRowSkeleton /> : null}

            {results.status === "loading" ? (
              <p
                className="absolute inset-0 z-30 flex items-center justify-center text-sm font-semibold text-white"
                role="status"
              >
                Loading {genreName(results.genreId)} movies…
              </p>
            ) : null}

            {results.status === "error" ? (
              <div
                className="flex min-h-40 flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 text-center text-sm text-white/72"
                role="alert"
              >
                <span>{genreName(results.genreId)} movies could not be loaded.</span>
                <button
                  className={retryButtonClassName}
                  onClick={() => void loadGenreMovies(results.genreId)}
                  type="button"
                >
                  Try again
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}

function PosterRowSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid auto-cols-[7.5rem] grid-flow-col gap-3.5 overflow-hidden sm:auto-cols-[10.5rem] sm:gap-5 lg:auto-cols-[13rem] lg:gap-8"
    >
      {Array.from({ length: 7 }, (_, index) => (
        <div className="aspect-[7/10] animate-pulse rounded-xl bg-white/[0.05]" key={index} />
      ))}
    </div>
  );
}
