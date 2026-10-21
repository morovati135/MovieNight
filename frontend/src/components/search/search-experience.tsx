"use client";

import { type FormEvent, useEffect, useId, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Search, X } from "lucide-react";

import { SectionNotice } from "@/components/home/home-states";
import { sectionTitleClassName } from "@/components/layout/section-heading";
import { MovieGrid, movieGridClassName } from "@/components/movie/movie-grid";
import { glassControlClassName } from "@/components/ui/controls";
import { discoverMovies, getGenres, searchMovies } from "@/lib/api/movies";
import type { MovieSummary, PagedMovieResult } from "@/types/movie";

import { type GenreOptions, SearchFilters } from "./search-filters";
import { hasFilters, matchesFilters, noFilters, type SearchFilters as Filters, searchHref } from "./search-state";

const searchDebounceMs = 350;

type SearchResultsState = { attempt: number; requestKey: string } & (
  | { status: "error" }
  | { status: "ready"; result: PagedMovieResult }
);

type SearchExperienceProps = {
  /** Trimmed title query from the URL; when present, the filters narrow its matches. */
  query: string;
  filters: Filters;
  savedMovieIds: Set<number>;
  updatingMovieIds: Set<number>;
  onWatchlistToggle: (movie: MovieSummary) => void;
};

function SearchGridSkeleton() {
  return (
    <div aria-hidden="true" className={movieGridClassName}>
      {Array.from({ length: 12 }, (_, index) => (
        <div className="aspect-[7/10] rounded-xl bg-white/6 motion-safe:animate-pulse" key={index} />
      ))}
    </div>
  );
}

export function SearchExperience({
  filters: urlFilters,
  onWatchlistToggle,
  query,
  savedMovieIds,
  updatingMovieIds,
}: SearchExperienceProps) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  const [genres, setGenres] = useState<GenreOptions>({ status: "loading" });
  const [results, setResults] = useState<SearchResultsState | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Filter choices apply here immediately, so a second change made before the URL updates keeps the first.
  const [selectedFilters, setSelectedFilters] = useState(urlFilters);
  const [syncedFilters, setSyncedFilters] = useState(urlFilters);

  // Back/Forward changes the URL query: show it in the input unless it already matches what is typed.
  if (query !== syncedQuery) {
    setSyncedQuery(query);

    if (input.trim() !== query) {
      setInput(query);
    }
  }

  if (urlFilters !== syncedFilters) {
    setSyncedFilters(urlFilters);
    setSelectedFilters(urlFilters);
  }

  useEffect(() => {
    let isCurrent = true;

    getGenres()
      .then((genreList) => {
        if (isCurrent) {
          setGenres({ genres: genreList, status: "ready" });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setGenres({ status: "error" });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  // A genre from the URL that the backend does not list is ignored rather than sent.
  const filters: Filters =
    genres.status === "ready" &&
    urlFilters.genreId !== null &&
    !genres.genres.some((genre) => genre.id === urlFilters.genreId)
      ? { ...urlFilters, genreId: null }
      : urlFilters;

  // Mode rule: a title query searches by title (the backend applies the year; genre and rating then narrow
  // those matches here); otherwise any filter discovers by filter; otherwise nothing is requested.
  const mode = query ? "search" : hasFilters(filters) ? "discover" : "idle";
  // A genre filter is only sent once the genre list confirms it (or could not be loaded at all).
  const isWaitingForGenres = mode === "discover" && filters.genreId !== null && genres.status === "loading";
  const requestKey =
    mode === "search"
      ? `search:${query}:${filters.year}`
      : mode === "discover" && !isWaitingForGenres
        ? `discover:${filters.genreId}:${filters.year}:${filters.minRating}`
        : "";

  // Typing updates the URL after a short pause; the URL query is what actually gets searched.
  useEffect(() => {
    const trimmedInput = input.trim();

    if (trimmedInput === query) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace(searchHref({ filters: selectedFilters, query: trimmedInput }), { scroll: false });
    }, searchDebounceMs);

    return () => window.clearTimeout(timer);
  }, [input, query, router, selectedFilters]);

  // All filters are sent for Discover; for a title only the year is, so genre and rating changes stay local.
  const { genreId, minRating } = mode === "discover" ? filters : noFilters;
  const { year } = filters;

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    let isCurrent = true;
    const request = query ? searchMovies(query, year) : discoverMovies({ genreId, minRating, year });

    request
      .then((result) => {
        if (isCurrent) {
          setResults({ attempt, requestKey, result, status: "ready" });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setResults({ attempt, requestKey, status: "error" });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt, genreId, minRating, query, requestKey, year]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedInput = input.trim();

    if (trimmedInput !== query) {
      router.replace(searchHref({ filters: selectedFilters, query: trimmedInput }), { scroll: false });
    }
  };

  const handleClear = () => {
    setInput("");
    inputRef.current?.focus();
  };

  const handleFiltersChange = (nextFilters: Filters) => {
    setSelectedFilters(nextFilters);
    router.replace(searchHref({ filters: nextFilters, query }), { scroll: false });
  };

  // Results for an older request or attempt are never shown; until the current ones arrive, the view is loading.
  const current =
    requestKey && results?.requestKey === requestKey && results.attempt === attempt ? results : null;
  const isLoading = isWaitingForGenres || (requestKey !== "" && !current);

  const genreName =
    genres.status === "ready" ? genres.genres.find((genre) => genre.id === filters.genreId)?.name : undefined;
  const genreLabel = genreName ?? (filters.genreId !== null ? "Selected genre" : null);
  const ratingLabel = filters.minRating !== null ? `Rated ${filters.minRating}+` : null;
  const filterSummary = [genreLabel, filters.year?.toString(), ratingLabel].filter(Boolean).join(" · ");
  const localFilterSummary = [genreLabel, ratingLabel].filter(Boolean).join(" · ");
  const titleLabel = `“${query}”${filters.year !== null ? ` from ${filters.year}` : ""}`;

  // Title Search cannot filter by genre or rating on the backend, so those narrow the loaded title matches here.
  const localFilters: Filters = { ...filters, year: null };
  const isRefined = mode === "search" && hasFilters(localFilters);
  const loadedMovies = current?.status === "ready" ? current.result.results : [];
  const shownMovies = isRefined ? loadedMovies.filter((movie) => matchesFilters(movie, localFilters)) : loadedMovies;
  const totalResults = current?.status === "ready" ? current.result.totalResults : 0;
  const checkedMatches =
    loadedMovies.length >= totalResults
      ? `${totalResults} ${totalResults === 1 ? "match" : "matches"}`
      : `the first ${loadedMovies.length} matches`;

  const handleShowAllTitleMatches = () => handleFiltersChange(noFilters);
  const handleBrowseFiltersOnly = () => {
    setInput("");
    router.replace(searchHref({ filters: selectedFilters, query: "" }), { scroll: false });
  };

  return (
    <section
      aria-busy={isLoading}
      aria-labelledby="search-heading"
      className="flex w-full flex-1 flex-col px-4 pt-24 pb-12 sm:px-8 sm:pt-36 sm:pb-20 lg:px-12 lg:pt-40 lg:pb-24"
    >
      <div className="mb-5 flex min-h-11 items-center justify-between gap-4 sm:mb-7">
        <h1 className={sectionTitleClassName} id="search-heading">
          Search
        </h1>
        <button
          aria-label="Close search"
          className={glassControlClassName}
          onClick={() => router.push("/", { scroll: false })}
          type="button"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>

      <form className="relative" onSubmit={handleSubmit} role="search">
        <label className="sr-only" htmlFor={inputId}>
          Search movies by title
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-white/60 sm:left-6 sm:size-6"
        />
        <input
          autoComplete="off"
          autoFocus
          className="h-14 w-full rounded-2xl border border-[#1d98d5]/55 bg-[#061126]/78 pr-14 pl-12 text-base font-semibold text-white shadow-[0_14px_45px_rgb(0_0_0/22%)] outline-none backdrop-blur-xl transition-[border-color,box-shadow] placeholder:font-medium placeholder:text-white/45 focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_rgb(41_187_244/22%),0_14px_45px_rgb(0_0_0/22%)] sm:h-16 sm:rounded-[1.25rem] sm:pr-16 sm:pl-16 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
          enterKeyHint="search"
          id={inputId}
          maxLength={100}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search for a movie title"
          ref={inputRef}
          spellCheck={false}
          type="search"
          value={input}
        />
        {input ? (
          <button
            aria-label="Clear search"
            className="absolute top-1/2 right-1.5 flex size-11 -translate-y-1/2 items-center justify-center rounded-xl text-white/70 outline-none transition-colors hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-ring sm:right-2.5"
            onClick={handleClear}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        ) : null}
      </form>

      <SearchFilters
        filters={selectedFilters}
        genres={genres}
        onChange={handleFiltersChange}
      />

      <div className={mode !== "idle" ? "mt-6 flex min-h-11 items-center sm:mt-9" : "mt-6 sm:mt-9"}>
        {shownMovies.length > 0 ? (
          <p className="text-sm text-white/68 sm:text-base" role="status">
            {isRefined ? (
              <>
                <span className="font-bold text-white">{shownMovies.length}</span> of {checkedMatches} for{" "}
                <span className="font-bold text-white">{titleLabel}</span> fit{" "}
                <span className="font-bold text-white">{localFilterSummary}</span>
              </>
            ) : (
              <>
                <span className="font-bold text-white">{totalResults.toLocaleString("en-US")}</span>{" "}
                {totalResults === 1 ? "movie" : "movies"}{" "}
                {mode === "search" ? (
                  <>
                    found for <span className="font-bold text-white">{titleLabel}</span>
                  </>
                ) : (
                  <>
                    match <span className="font-bold text-white">{filterSummary}</span>
                  </>
                )}
              </>
            )}
          </p>
        ) : null}
        {isLoading ? (
          <p className="text-sm font-semibold text-white/68 sm:text-base" role="status">
            {mode === "search" ? `Searching for ${titleLabel}…` : `Finding ${filterSummary} movies…`}
          </p>
        ) : null}
      </div>

      <div className={mode !== "idle" ? "mt-2 sm:mt-3" : undefined}>
        {mode === "idle" ? (
          <SectionNotice tone="empty">Type a movie title, or choose a genre, year or rating.</SectionNotice>
        ) : null}

        {isLoading ? <SearchGridSkeleton /> : null}

        {current?.status === "error" ? (
          <SectionNotice onAction={() => setAttempt((previous) => previous + 1)}>
            {mode === "search" ? "Search isn’t available right now." : "Movies couldn’t be loaded right now."}
          </SectionNotice>
        ) : null}

        {/* Empty results always offer a way forward instead of a dead end. */}
        {current?.status === "ready" && shownMovies.length === 0 && mode === "search" && hasFilters(filters) ? (
          <SectionNotice
            actionLabel={`Show all “${query}” matches`}
            onAction={handleShowAllTitleMatches}
            onSecondaryAction={handleBrowseFiltersOnly}
            secondaryActionLabel={`Browse ${filterSummary} movies`}
            tone="empty"
          >
            {loadedMovies.length > 0
              ? `None of ${checkedMatches} for ${titleLabel} fit ${localFilterSummary}.`
              : `No movies match ${titleLabel}.`}
          </SectionNotice>
        ) : null}

        {current?.status === "ready" && shownMovies.length === 0 && mode === "search" && !hasFilters(filters) ? (
          <SectionNotice tone="empty">No movies match “{query}”. Try a different title.</SectionNotice>
        ) : null}

        {current?.status === "ready" && shownMovies.length === 0 && mode === "discover" ? (
          <SectionNotice actionLabel="Clear filters" onAction={handleShowAllTitleMatches} tone="empty">
            No movies match {filterSummary}.
          </SectionNotice>
        ) : null}

        {shownMovies.length > 0 ? (
          <MovieGrid
            movies={shownMovies}
            onWatchlistToggle={onWatchlistToggle}
            savedMovieIds={savedMovieIds}
            updatingMovieIds={updatingMovieIds}
          />
        ) : null}
      </div>
    </section>
  );
}
