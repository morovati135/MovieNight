/*
 * Search view state lives in the `/` URL so Back/Forward and reloads keep it.
 * Values outside the backend's accepted ranges are dropped while parsing, so they never reach a request.
 */

import type { DiscoverFilters } from "@/lib/api/movies";
import type { MovieSummary } from "@/types/movie";

// Backend Discover limits: Year 1888–2100, Minimum Rating 0–10.
export const earliestReleaseYear = 1888;
export const latestReleaseYear = Math.min(new Date().getFullYear() + 1, 2100);
export const minimumRatingOptions = [9, 8, 7, 6, 5, 4, 3, 2, 1];

export type SearchFilters = DiscoverFilters;

export type SearchState = {
  /** Trimmed title query; when present it is searched and the filters narrow its matches. */
  query: string;
  filters: SearchFilters;
};

export const noFilters: SearchFilters = { genreId: null, minRating: null, year: null };

type ReadableParams = { get(name: string): string | null; has(name: string): boolean };

function parseInteger(value: string | null, minimum: number, maximum: number) {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);

  return number >= minimum && number <= maximum ? number : null;
}

export function parseSearchState(params: ReadableParams): SearchState & { isOpen: boolean } {
  const query = params.get("q")?.trim() ?? "";
  const filters: SearchFilters = {
    genreId: parseInteger(params.get("genre"), 1, Number.MAX_SAFE_INTEGER),
    minRating: parseInteger(params.get("rating"), 0, 10),
    year: parseInteger(params.get("year"), earliestReleaseYear, latestReleaseYear),
  };

  return {
    filters,
    isOpen: params.has("search") || query !== "" || hasFilters(filters),
    query,
  };
}

export function hasFilters(filters: SearchFilters) {
  return filters.genreId !== null || filters.year !== null || filters.minRating !== null;
}

/** Same rules as the backend Discover filters, applied to movies already loaded by title Search. */
export function matchesFilters(movie: MovieSummary, filters: SearchFilters) {
  return (
    (filters.genreId === null || movie.genreIds.includes(filters.genreId)) &&
    (filters.year === null || movie.releaseDate?.startsWith(`${filters.year}-`) === true) &&
    (filters.minRating === null || movie.voteAverage >= filters.minRating)
  );
}

export function countFilters(filters: SearchFilters) {
  return [filters.genreId, filters.year, filters.minRating].filter((value) => value !== null).length;
}

/** URL for the Search view on Home. */
export function searchHref({ filters, query }: SearchState) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (filters.genreId !== null) {
    params.set("genre", filters.genreId.toString());
  }

  if (filters.year !== null) {
    params.set("year", filters.year.toString());
  }

  if (filters.minRating !== null) {
    params.set("rating", filters.minRating.toString());
  }

  return params.size > 0 ? `/?${params}` : "/?search=open";
}
