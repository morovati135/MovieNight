import type { Genre, MovieDetails, MovieSummary, PagedMovieResult } from "@/types/movie";

import { apiFetch } from "./client";

/** The backend answered 404: the requested movie does not exist. */
export class MovieNotFoundError extends Error {}

async function getJson<T>(path: string, errorMessage: string): Promise<T> {
  const response = await apiFetch(path);

  if (response.status === 404) {
    throw new MovieNotFoundError(errorMessage);
  }

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export function getGenres(): Promise<Genre[]> {
  return getJson("/api/movies/genres", "Movie genres could not be loaded.");
}

export function getTrendingMovies(): Promise<PagedMovieResult> {
  return getJson("/api/movies/trending", "Trending movies could not be loaded.");
}

export function getMovieDetails(movieId: number): Promise<MovieDetails> {
  return getJson(`/api/movies/${movieId}`, "Movie details could not be loaded.");
}

export function getPopularMovies(): Promise<PagedMovieResult> {
  return getJson("/api/movies/popular", "Popular movies could not be loaded.");
}

export function searchMovies(query: string, year: number | null = null, page = 1): Promise<PagedMovieResult> {
  const parameters = new URLSearchParams({ query });

  if (year !== null) {
    parameters.set("year", year.toString());
  }

  if (page > 1) {
    parameters.set("page", page.toString());
  }

  return getJson(`/api/movies/search?${parameters}`, "Movies could not be searched.");
}

export function discoverMoviesByGenre(genreId: number): Promise<PagedMovieResult> {
  const parameters = new URLSearchParams({ genreId: genreId.toString() });

  return getJson(
    `/api/movies/discover?${parameters}`,
    "Movies for this genre could not be loaded.",
  );
}

export type DiscoverFilters = {
  genreId: number | null;
  year: number | null;
  minRating: number | null;
};

function filterParameters(filters: DiscoverFilters) {
  const parameters = new URLSearchParams();

  if (filters.genreId !== null) {
    parameters.set("genreId", filters.genreId.toString());
  }

  if (filters.year !== null) {
    parameters.set("year", filters.year.toString());
  }

  if (filters.minRating !== null) {
    parameters.set("minRating", filters.minRating.toString());
  }

  return parameters;
}

export function discoverMovies(filters: DiscoverFilters, page = 1): Promise<PagedMovieResult> {
  const parameters = filterParameters(filters);

  if (page > 1) {
    parameters.set("page", page.toString());
  }

  return getJson(`/api/movies/discover?${parameters}`, "Movies could not be discovered.");
}

/** One movie matching the filters, picked by the backend; a `MovieNotFoundError` means nothing matched. */
export function pickMovie(filters: DiscoverFilters): Promise<MovieSummary> {
  const parameters = filterParameters(filters);
  const query = parameters.size > 0 ? `?${parameters}` : "";

  return getJson(`/api/movies/pick${query}`, "A movie could not be picked.");
}
