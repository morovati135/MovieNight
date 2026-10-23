"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getImageProps } from "next/image";

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

// Must match the poster card's `sizes`, so the browser warms the same image candidate the card will request.
const posterSizes = "(max-width: 639px) 112px, (max-width: 1023px) 168px, 208px";
const warmedPosterCount = 12;

/** True on Save-Data or slow connections, where downloading posters nobody asked for would cost real data. */
function isDataConstrained() {
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;

  return Boolean(connection?.saveData) || /(^|-)[23]g$/.test(connection?.effectiveType ?? "");
}

/** Starts downloading the first posters of a genre, so they are already cached when its row appears. */
function warmPosters(movies: MovieSummary[]) {
  for (const movie of movies.slice(0, warmedPosterCount)) {
    if (!movie.posterUrl) {
      continue;
    }

    const { props } = getImageProps({ alt: "", fill: true, sizes: posterSizes, src: movie.posterUrl });
    const image = new Image();
    image.sizes = posterSizes;
    image.srcset = props.srcSet ?? "";
    image.src = props.src;
  }
}

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
  // Movies already fetched per genre (shown instantly on select) and requests still in flight (shared).
  const cacheRef = useRef(new Map<number, MovieSummary[]>());
  const pendingRef = useRef(new Map<number, Promise<MovieSummary[]>>());
  const sectionRef = useRef<HTMLElement>(null);
  // Below the fold: load only when the section comes near the viewport, so it never competes with the hero.
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || isNear) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
        }
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, [isNear]);

  /** Fetches a genre's movies once; later calls reuse the cached list or the request already in flight. */
  const fetchGenre = useCallback((genreId: number) => {
    const pending = pendingRef.current.get(genreId);

    if (pending) {
      return pending;
    }

    const request = discoverMoviesByGenre(genreId)
      .then((result) => {
        cacheRef.current.set(genreId, result.results);
        warmPosters(result.results);
        return result.results;
      })
      .finally(() => pendingRef.current.delete(genreId));
    pendingRef.current.set(genreId, request);

    return request;
  }, []);

  const prefetchGenre = useCallback(
    (genreId: number) => {
      if (!cacheRef.current.has(genreId)) {
        fetchGenre(genreId).catch(() => undefined);
      }
    },
    [fetchGenre],
  );

  const loadGenreMovies = useCallback(async (genreId: number) => {
    const requestId = resultsRequestIdRef.current + 1;
    resultsRequestIdRef.current = requestId;
    const cached = cacheRef.current.get(genreId);

    if (cached) {
      setResults({ genreId, movies: cached, status: "ready" });
      return;
    }

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
      const movies = await fetchGenre(genreId);

      if (resultsRequestIdRef.current === requestId) {
        setResults({ genreId, movies, status: "ready" });
      }
    } catch {
      if (resultsRequestIdRef.current === requestId) {
        setResults({ genreId, status: "error" });
      }
    }
  }, [fetchGenre]);

  useEffect(() => {
    if (!isNear) {
      return;
    }

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
  }, [genreListRequest, isNear, loadGenreMovies]);

  // Once the first genre is on screen, quietly warm the others one at a time while the browser is idle,
  // so choosing a genre later swaps in instantly instead of loading in front of the user.
  const firstShownGenreId = results?.status === "ready" ? results.genreId : null;
  const genres = genreList.status === "ready" ? genreList.genres : null;

  useEffect(() => {
    if (firstShownGenreId === null || !genres || isDataConstrained()) {
      return;
    }

    let isCurrent = true;
    let timer: number | undefined;
    const queue = genres.map((genre) => genre.id).filter((id) => id !== firstShownGenreId);

    const next = () => {
      const genreId = queue.shift();

      if (!isCurrent || genreId === undefined) {
        return;
      }

      const schedule = () => {
        timer = window.setTimeout(next, 400);
      };

      if (cacheRef.current.has(genreId)) {
        next();
        return;
      }

      fetchGenre(genreId).then(schedule, schedule);
    };

    timer = window.setTimeout(next, 800);

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
    // Only the first ready genre starts the warm-up; later selections must not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genres, firstShownGenreId === null, fetchGenre]);

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
      ref={sectionRef}
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
            onIntent={prefetchGenre}
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
