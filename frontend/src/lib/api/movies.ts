import type { Genre, MovieCollection, MovieDetails, MovieSummary, PagedMovieResult } from "@/types/movie";

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

function pageQuery(page: number) {
  return page > 1 ? `?page=${page}` : "";
}

export function getTrendingMovies(page = 1): Promise<PagedMovieResult> {
  return getJson(`/api/movies/trending${pageQuery(page)}`, "Trending movies could not be loaded.");
}

export function getMovieDetails(movieId: number): Promise<MovieDetails> {
  return getJson(`/api/movies/${movieId}`, "Movie details could not be loaded.");
}

/** The highest rated films that very many people have rated ("Iconic: Top rated of all time"). */
export function getTopRatedMovies(page = 1): Promise<PagedMovieResult> {
  return getJson(`/api/movies/top-rated${pageQuery(page)}`, "Top rated movies could not be loaded.");
}

export function getCollections(): Promise<MovieCollection[]> {
  return getJson("/api/collections", "Collections could not be loaded.");
}

export function getPopularMovies(page = 1): Promise<PagedMovieResult> {
  return getJson(`/api/movies/popular${pageQuery(page)}`, "Popular movies could not be loaded.");
}

/** One page of a curated collection's movies; a `MovieNotFoundError` means the collection does not exist. */
export function getCollectionMovies(slug: string, page = 1): Promise<PagedMovieResult> {
  return getJson(
    `/api/collections/${encodeURIComponent(slug)}/movies${pageQuery(page)}`,
    "Collection movies could not be loaded.",
  );
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
