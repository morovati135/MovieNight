"use client";

import { type FormEvent, useEffect, useId, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { LoaderCircle, RotateCcw, Search, X } from "lucide-react";

import { SectionNotice } from "@/components/home/home-states";
import { sectionTitleClassName } from "@/components/layout/section-title";
import { MovieGrid, movieGridClassName } from "@/components/movie/movie-grid";
import { Button } from "@/components/ui/button";
import { glassControlClassName } from "@/components/ui/controls";
import { discoverMovies, getGenres, searchMovies } from "@/lib/api/movies";
import type { MovieSummary, PagedMovieResult } from "@/types/movie";

import { type GenreOptions, SearchFilters } from "./search-filters";
import { hasFilters, matchesFilters, noFilters, type SearchFilters as Filters, searchHref } from "./search-state";

const searchDebounceMs = 350;
// The backend accepts pages 1–500.
const backendPageLimit = 500;
// When genre/rating narrow a title search, further title pages load automatically until this many movies
// show, checking at most `autoLoadPageLimit` pages; "Load more" continues from there.
const autoFillTarget = 12;
const autoLoadPageLimit = 5;

/** Pages loaded so far for one request; `failedPage` is the page whose request failed, if any. */
type SearchResultsState = { requestKey: string; pages: PagedMovieResult[]; failedPage: number | null };

const loadMoreClassName = "min-h-12 rounded-full border-white/25 bg-glass/65 px-6 text-white hover:bg-white/10";

function uniqueMovies(pages: PagedMovieResult[]) {
  const seen = new Set<number>();

  // TMDB can repeat a movie on neighbouring pages when rankings shift between requests.
  return pages
    .flatMap((page) => page.results)
    .filter((movie) => {
      if (seen.has(movie.id)) {
        return false;
      }

      seen.add(movie.id);
      return true;
    });
}

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
  const [requestedPages, setRequestedPages] = useState<{ requestKey: string; count: number } | null>(null);

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

  // Pages for an older request are never shown.
  const loaded = results?.requestKey === requestKey ? results : null;
  const pages = loaded?.pages ?? [];
  const failedPage = loaded?.failedPage ?? null;
  const totalPages = Math.min(pages[0]?.totalPages ?? 1, backendPageLimit);
  const totalResults = pages[0]?.totalResults ?? 0;
  const hasMorePages = pages.length > 0 && pages.length < totalPages;

  // Title Search cannot filter by genre or rating on the backend, so those narrow the loaded title matches here.
  const localFilters: Filters = { ...filters, year: null };
  const isRefined = mode === "search" && hasFilters(localFilters);
  const loadedMovies = uniqueMovies(pages);
  const shownMovies = isRefined ? loadedMovies.filter((movie) => matchesFilters(movie, localFilters)) : loadedMovies;

  const shouldAutoLoad =
    isRefined && hasMorePages && shownMovies.length < autoFillTarget && pages.length < autoLoadPageLimit;
  const wantedPageCount = Math.max(
    requestedPages?.requestKey === requestKey ? requestedPages.count : 1,
    shouldAutoLoad ? pages.length + 1 : 1,
  );
  const nextPage =
    requestKey && failedPage === null && pages.length < wantedPageCount && (pages.length === 0 || hasMorePages)
      ? pages.length + 1
      : null;

  useEffect(() => {
    if (nextPage === null) {
      return;
    }

    let isCurrent = true;
    const request = query
      ? searchMovies(query, year, nextPage)
      : discoverMovies({ genreId, minRating, year }, nextPage);

    request
      .then((result) => {
        if (isCurrent) {
          setResults((previous) => ({
            failedPage: null,
            pages: [...(previous?.requestKey === requestKey ? previous.pages.slice(0, nextPage - 1) : []), result],
            requestKey,
          }));
        }
      })
      .catch(() => {
        if (isCurrent) {
          setResults((previous) => ({
            failedPage: nextPage,
            pages: previous?.requestKey === requestKey ? previous.pages : [],
            requestKey,
          }));
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [genreId, minRating, nextPage, query, requestKey, year]);

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

  const isLoading = isWaitingForGenres || (requestKey !== "" && pages.length === 0 && failedPage === null);
  const isLoadingMore = pages.length > 0 && nextPage !== null;
  const isReady = pages.length > 0;

  const handleRetry = () => {
    setResults((previous) => (previous ? { ...previous, failedPage: null } : previous));
  };

  const handleLoadMore = () => {
    setRequestedPages({ count: pages.length + 1, requestKey });
  };

  const genreName =
    genres.status === "ready" ? genres.genres.find((genre) => genre.id === filters.genreId)?.name : undefined;
  const genreLabel = genreName ?? (filters.genreId !== null ? "Selected genre" : null);
  const ratingLabel = filters.minRating !== null ? `Rated ${filters.minRating}+` : null;
  const filterSummary = [genreLabel, filters.year?.toString(), ratingLabel].filter(Boolean).join(" · ");
  const localFilterSummary = [genreLabel, ratingLabel].filter(Boolean).join(" · ");
  const titleLabel = `“${query}”${filters.year !== null ? ` from ${filters.year}` : ""}`;

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

        {failedPage === 1 ? (
          <SectionNotice onAction={handleRetry}>
            {mode === "search" ? "Search isn’t available right now." : "Movies couldn’t be loaded right now."}
          </SectionNotice>
        ) : null}

        {isReady && shownMovies.length === 0 && isLoadingMore ? (
          <SectionNotice tone="empty">Checking more matches for {titleLabel}…</SectionNotice>
        ) : null}

        {/* Empty results always offer a way forward instead of a dead end. */}
        {isReady && !isLoadingMore && shownMovies.length === 0 && mode === "search" && hasFilters(filters) ? (
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

        {isReady && shownMovies.length === 0 && mode === "search" && !hasFilters(filters) ? (
          <SectionNotice tone="empty">No movies match “{query}”. Try a different title.</SectionNotice>
        ) : null}

        {isReady && shownMovies.length === 0 && mode === "discover" ? (
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

        {isReady && (hasMorePages || failedPage !== null) ? (
          <div className="mt-10 flex flex-col items-center gap-3 text-center sm:mt-14">
            {failedPage !== null ? (
              <>
                <p className="text-sm text-white/72" role="alert">
                  More movies couldn’t be loaded.
                </p>
                <Button className={loadMoreClassName} onClick={handleRetry} type="button" variant="outline">
                  <RotateCcw aria-hidden="true" />
                  Try again
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-white/55">
                  {isRefined
                    ? `Checked ${loadedMovies.length.toLocaleString("en-US")} of ${totalResults.toLocaleString("en-US")} title matches`
                    : `Showing ${loadedMovies.length.toLocaleString("en-US")} of ${totalResults.toLocaleString("en-US")}`}
                </p>
                {/* Stays enabled while loading so keyboard focus is not lost; extra clicks are ignored. */}
                <Button
                  aria-busy={isLoadingMore}
                  className={loadMoreClassName}
                  onClick={isLoadingMore ? undefined : handleLoadMore}
                  type="button"
                  variant="outline"
                >
                  {isLoadingMore ? (
                    <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
                  ) : null}
                  {isLoadingMore ? "Loading…" : isRefined ? "Check more matches" : "Load more"}
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
