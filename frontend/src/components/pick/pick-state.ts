/*
 * Pick for Me filters live in the `/pick` URL so a reload, Back/Forward or a shared link keeps them.
 * The picked movie is random and is never part of the URL.
 */

import { earliestReleaseYear, latestReleaseYear } from "@/components/search/search-state";
import type { DiscoverFilters } from "@/lib/api/movies";

export type PickFilters = DiscoverFilters;

/** Minimum rating steps offered by the picker (D028 keeps them to movies rated by enough people). */
export const pickRatingOptions = [6, 7, 8];

type ReadableParams = { get(name: string): string | null };

function parseInteger(value: string | null, minimum: number, maximum: number) {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);

  return number >= minimum && number <= maximum ? number : null;
}

export function parsePickFilters(params: ReadableParams): PickFilters {
  const rating = parseInteger(params.get("rating"), 0, 10);

  return {
    genreId: parseInteger(params.get("genre"), 1, Number.MAX_SAFE_INTEGER),
    minRating: rating !== null && pickRatingOptions.includes(rating) ? rating : null,
    year: parseInteger(params.get("year"), earliestReleaseYear, latestReleaseYear),
  };
}

export function pickHref(filters: PickFilters) {
  const params = new URLSearchParams();

  if (filters.genreId !== null) {
    params.set("genre", filters.genreId.toString());
  }

  if (filters.year !== null) {
    params.set("year", filters.year.toString());
  }

  if (filters.minRating !== null) {
    params.set("rating", filters.minRating.toString());
  }

  return params.size > 0 ? `/pick?${params}` : "/pick";
}

/** The prompt sentence: restates the choice in plain words and says what the picker actually does. */
export function describePick(filters: PickFilters, genreName: string | null) {
  const subject = !genreName ? "movie" : /movie$/i.test(genreName) ? genreName : `${genreName} movie`;
  const year = filters.year !== null ? ` from ${filters.year}` : "";
  const rating = filters.minRating !== null ? `, rated ${filters.minRating}+` : "";

  return `One ${subject}${year}${rating}, picked from what’s popular.`;
}
