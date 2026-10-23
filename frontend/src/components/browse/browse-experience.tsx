"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ChevronLeft, LoaderCircle, RotateCcw } from "lucide-react";

import { SectionNotice } from "@/components/home/home-states";
import { sectionTitleClassName } from "@/components/layout/section-heading";
import { MovieGrid, movieGridClassName } from "@/components/movie/movie-grid";
import { Button } from "@/components/ui/button";
import { inlineLinkClassName } from "@/components/ui/controls";
import { useWatchlist } from "@/components/watchlist/use-watchlist";
import {
  getCollectionMovies,
  getCollections,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  MovieNotFoundError,
} from "@/lib/api/movies";
import type { PagedMovieResult } from "@/types/movie";

// The backend accepts pages 1–500.
const backendPageLimit = 500;

const loadMoreClassName = "min-h-12 rounded-full border-white/25 bg-glass/65 px-6 text-white hover:bg-white/10";

const listCategories: Record<string, { title: string; load: (page: number) => Promise<PagedMovieResult> }> = {
  iconic: { load: getTopRatedMovies, title: "Iconic: Top rated of all time" },
  popular: { load: getPopularMovies, title: "Popular Movies" },
  trending: { load: getTrendingMovies, title: "Trending Now" },
};

/** Pages loaded so far for one category; `failedPage` is the page whose request failed, if any. */
type BrowseState =
  | { category: string; status: "not-found" }
  | { category: string; status: "error" }
  | { category: string; status: "ready"; title: string; pages: PagedMovieResult[]; failedPage: number | null };

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

/** Loads one page of a category with its display title; an unknown collection throws `MovieNotFoundError`. */
async function loadCategoryPage(category: string, page: number): Promise<{ title: string; result: PagedMovieResult }> {
  const listCategory = listCategories[category];

  if (listCategory) {
    return { result: await listCategory.load(page), title: listCategory.title };
  }

  if (!/^[a-z0-9-]{1,60}$/.test(category)) {
    throw new MovieNotFoundError("Unknown category.");
  }

  const [result, collections] = await Promise.all([
    getCollectionMovies(category, page),
    getCollections().catch(() => []),
  ]);

  return { result, title: collections.find((collection) => collection.slug === category)?.title ?? "Collection" };
}

function BrowseSkeleton() {
  return (
    <div aria-hidden="true" className={movieGridClassName}>
      {Array.from({ length: 12 }, (_, index) => (
        <div className="aspect-[7/10] rounded-xl bg-white/6 motion-safe:animate-pulse" key={index} />
      ))}
    </div>
  );
}

export function BrowseExperience({ category }: { category: string }) {
  const { savedMovieIds, statusMessage, toggle, updatingMovieIds } = useWatchlist();
  const [state, setState] = useState<BrowseState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    loadCategoryPage(category, 1)
      .then(
        ({ result, title }) =>
          isCurrent && setState({ category, failedPage: null, pages: [result], status: "ready", title }),
      )
      .catch(
        (error: unknown) =>
          isCurrent && setState({ category, status: error instanceof MovieNotFoundError ? "not-found" : "error" }),
      );

    return () => {
      isCurrent = false;
    };
  }, [attempt, category]);

  // State for another category is never shown.
  const current = state?.category === category ? state : null;
  const pages = current?.status === "ready" ? current.pages : [];
  const failedPage = current?.status === "ready" ? current.failedPage : null;
  const totalPages = Math.min(pages[0]?.totalPages ?? 1, backendPageLimit);
  const totalResults = pages[0]?.totalResults ?? 0;
  const movies = uniqueMovies(pages);
  const hasMorePages = pages.length > 0 && pages.length < totalPages;
  const title = current?.status === "ready" ? current.title : (listCategories[category]?.title ?? "Browse");

  const handleRetry = () => {
    setState(null);
    setAttempt((previous) => previous + 1);
  };

  const loadPage = (page: number) => {
    setIsLoadingMore(true);

    loadCategoryPage(category, page)
      .then(({ result }) =>
        setState((previous) =>
          previous?.category === category && previous.status === "ready"
            ? { ...previous, failedPage: null, pages: [...previous.pages.slice(0, page - 1), result] }
            : previous,
        ),
      )
      .catch(() =>
        setState((previous) =>
          previous?.category === category && previous.status === "ready" ? { ...previous, failedPage: page } : previous,
        ),
      )
      .finally(() => setIsLoadingMore(false));
  };

  return (
    <section
      aria-busy={current === null}
      aria-labelledby="browse-heading"
      className="flex w-full flex-1 flex-col px-4 pt-24 pb-12 sm:px-8 sm:pt-36 sm:pb-20 lg:px-12 lg:pt-40 lg:pb-24"
    >
      <div className="mb-5 flex min-h-11 flex-wrap items-center justify-between gap-x-6 gap-y-2 sm:mb-8">
        <h1 className={sectionTitleClassName} id="browse-heading">
          {current?.status === "not-found" ? "Not found" : title}
        </h1>
        <Link className={inlineLinkClassName} href="/">
          <ChevronLeft aria-hidden="true" className="size-4" />
          Back to Home
        </Link>
      </div>

      {current === null ? <BrowseSkeleton /> : null}

      {current?.status === "error" ? (
        <SectionNotice onAction={handleRetry}>Movies couldn’t be loaded right now.</SectionNotice>
      ) : null}

      {current?.status === "not-found" ? (
        <SectionNotice tone="empty">This collection doesn’t exist. Head back Home to pick another.</SectionNotice>
      ) : null}

      {current?.status === "ready" && movies.length === 0 ? (
        <SectionNotice tone="empty">There are no movies here yet.</SectionNotice>
      ) : null}

      {movies.length > 0 ? (
        <MovieGrid
          movies={movies}
          onWatchlistToggle={toggle}
          savedMovieIds={savedMovieIds}
          updatingMovieIds={updatingMovieIds}
        />
      ) : null}

      {movies.length > 0 && (hasMorePages || failedPage !== null) ? (
        <div className="mt-10 flex flex-col items-center gap-3 text-center sm:mt-14">
          {failedPage !== null ? (
            <>
              <p className="text-sm text-white/72" role="alert">
                More movies couldn’t be loaded.
              </p>
              <Button className={loadMoreClassName} onClick={() => loadPage(failedPage)} type="button" variant="outline">
                <RotateCcw aria-hidden="true" />
                Try again
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-white/55">
                Showing {movies.length.toLocaleString("en-US")} of {totalResults.toLocaleString("en-US")}
              </p>
              {/* Stays enabled while loading so keyboard focus is not lost; extra clicks are ignored. */}
              <Button
                aria-busy={isLoadingMore}
                className={loadMoreClassName}
                onClick={isLoadingMore ? undefined : () => loadPage(pages.length + 1)}
                type="button"
                variant="outline"
              >
                {isLoadingMore ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : null}
                {isLoadingMore ? "Loading…" : "Load more"}
              </Button>
            </>
          )}
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only" role="status">
        {statusMessage}
      </p>
    </section>
  );
}
