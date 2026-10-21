"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { sectionTitleClassName } from "@/components/layout/section-heading";
import { GenreChips } from "@/components/movie/genre-chips";
import { MovieRow } from "@/components/movie/movie-row";
import { discoverMoviesByGenre, getGenres } from "@/lib/api/movies";
import type { Genre, MovieSummary } from "@/types/movie";

import { PosterRowSkeleton, SectionNotice } from "./home-states";

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
      className="relative isolate"
    >
      <div className="relative z-10 mb-4 flex min-h-11 items-center justify-between sm:mb-7">
        <h2 className={sectionTitleClassName} id="genre-discovery-heading">
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
          <div className="mt-6 sm:mt-9">
            <PosterRowSkeleton />
          </div>
          <span className="sr-only" role="status">
            Loading genres…
          </span>
        </>
      ) : null}

      {genreList.status === "error" ? (
        <SectionNotice onAction={handleGenreListRetry}>Genres could not be loaded right now.</SectionNotice>
      ) : null}

      {genreList.status === "ready" && results ? (
        <>
          <GenreChips
            genres={genreList.genres}
            onSelect={handleGenreSelect}
            selectedGenreId={results.genreId}
          />
          <div className="relative mt-6 sm:mt-9">
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
                  <SectionNotice tone="empty">
                    No {genreName(shownResults.genreId)} movies to show right now.
                  </SectionNotice>
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
              <SectionNotice onAction={() => void loadGenreMovies(results.genreId)}>
                {genreName(results.genreId)} movies could not be loaded.
              </SectionNotice>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
