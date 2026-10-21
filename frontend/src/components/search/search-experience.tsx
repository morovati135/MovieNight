"use client";

import { type FormEvent, useEffect, useId, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Search, X } from "lucide-react";

import { SectionNotice } from "@/components/home/home-states";
import { sectionTitleClassName } from "@/components/layout/section-heading";
import { MovieGrid, movieGridClassName } from "@/components/movie/movie-grid";
import { glassControlClassName } from "@/components/ui/controls";
import { searchMovies } from "@/lib/api/movies";
import { cn } from "@/lib/utils";
import type { MovieSummary, PagedMovieResult } from "@/types/movie";

const searchDebounceMs = 350;

type SearchResultsState = { attempt: number; query: string } & (
  | { status: "error" }
  | { status: "ready"; result: PagedMovieResult }
);

type SearchExperienceProps = {
  /** Trimmed title query from the URL; an empty string means nothing has been searched yet. */
  query: string;
  savedMovieIds: Set<number>;
  updatingMovieIds: Set<number>;
  onWatchlistToggle: (movie: MovieSummary) => void;
};

/** URL for the Search view on Home; the query lives in the URL so Back/Forward and reloads keep it. */
export function searchHref(query: string) {
  return query ? `/?${new URLSearchParams({ q: query })}` : "/?search=open";
}

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
  const [results, setResults] = useState<SearchResultsState | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Back/Forward changes the URL query: show it in the input unless it already matches what is typed.
  if (query !== syncedQuery) {
    setSyncedQuery(query);

    if (input.trim() !== query) {
      setInput(query);
    }
  }

  // Typing updates the URL after a short pause; the URL query is what actually gets searched.
  useEffect(() => {
    const trimmedInput = input.trim();

    if (trimmedInput === query) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace(searchHref(trimmedInput), { scroll: false });
    }, searchDebounceMs);

    return () => window.clearTimeout(timer);
  }, [input, query, router]);

  // A blank query never reaches the backend.
  useEffect(() => {
    if (!query) {
      return;
    }

    let isCurrent = true;

    searchMovies(query)
      .then((result) => {
        if (isCurrent) {
          setResults({ attempt, query, result, status: "ready" });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setResults({ attempt, query, status: "error" });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt, query]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedInput = input.trim();

    if (trimmedInput !== query) {
      router.replace(searchHref(trimmedInput), { scroll: false });
    }
  };

  const handleClear = () => {
    setInput("");
    inputRef.current?.focus();
  };

  // Results for an older query or attempt are never shown; until the current ones arrive, the view is loading.
  const current =
    query && results?.query === query && results.attempt === attempt ? results : null;
  const isLoading = query !== "" && !current;

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

      <div className={cn("flex items-center", query ? "mt-6 min-h-11 sm:mt-9" : "mt-6 sm:mt-9")}>
        {current?.status === "ready" && current.result.results.length > 0 ? (
          <p className="text-sm text-white/68 sm:text-base" role="status">
            <span className="font-bold text-white">{current.result.totalResults.toLocaleString("en-US")}</span>{" "}
            {current.result.totalResults === 1 ? "movie" : "movies"} found for{" "}
            <span className="font-bold text-white">“{current.query}”</span>
          </p>
        ) : null}
        {isLoading ? (
          <p className="text-sm font-semibold text-white/68 sm:text-base" role="status">
            Searching for “{query}”…
          </p>
        ) : null}
      </div>

      <div className={query ? "mt-2 sm:mt-3" : undefined}>
        {!query ? (
          <SectionNotice tone="empty">Type a movie title to start searching.</SectionNotice>
        ) : null}

        {isLoading ? <SearchGridSkeleton /> : null}

        {current?.status === "error" ? (
          <SectionNotice onAction={() => setAttempt((previous) => previous + 1)}>
            Search isn’t available right now.
          </SectionNotice>
        ) : null}

        {current?.status === "ready" && current.result.results.length === 0 ? (
          <SectionNotice tone="empty">
            No movies match “{current.query}”. Try a different title.
          </SectionNotice>
        ) : null}

        {current?.status === "ready" && current.result.results.length > 0 ? (
          <MovieGrid
            movies={current.result.results}
            onWatchlistToggle={onWatchlistToggle}
            savedMovieIds={savedMovieIds}
            updatingMovieIds={updatingMovieIds}
          />
        ) : null}
      </div>
    </section>
  );
}
