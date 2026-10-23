import type { MovieSummary, PagedMovieResult } from "@/types/movie";

export function movie(id: number, overrides: Partial<MovieSummary> = {}): MovieSummary {
  return {
    backdropUrl: null,
    genreIds: [28],
    id,
    overview: `Overview ${id}`,
    posterUrl: null,
    releaseDate: "2020-01-01",
    title: `Movie ${id}`,
    voteAverage: 7.5,
    ...overrides,
  };
}

export function page(ids: number[], overrides: Partial<PagedMovieResult> = {}): PagedMovieResult {
  return { page: 1, results: ids.map((id) => movie(id)), totalPages: 1, totalResults: ids.length, ...overrides };
}

/** A JSON `Response` as `fetch` would return it. */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" }, status });
}
