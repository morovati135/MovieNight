import type { Genre, MovieDetails, PagedMovieResult } from "@/types/movie";

import { apiFetch } from "./client";

async function getJson<T>(path: string, errorMessage: string): Promise<T> {
  const response = await apiFetch(path);

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

export function searchMovies(query: string, year: number | null = null): Promise<PagedMovieResult> {
  const parameters = new URLSearchParams({ query });

  if (year !== null) {
    parameters.set("year", year.toString());
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

export function discoverMovies(filters: DiscoverFilters): Promise<PagedMovieResult> {
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

  return getJson(`/api/movies/discover?${parameters}`, "Movies could not be discovered.");
}
