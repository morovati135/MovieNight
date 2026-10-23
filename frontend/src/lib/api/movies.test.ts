import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { jsonResponse, page } from "@/test/fixtures";

import {
  discoverMovies,
  getCollectionMovies,
  getMovieDetails,
  getPopularMovies,
  getTrendingMovies,
  MovieNotFoundError,
  pickMovie,
  searchMovies,
} from "./movies";

const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

function requestedUrl() {
  return fetchMock.mock.calls[0][0];
}

describe("movies API client", () => {
  it("calls the configured backend and returns the parsed JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse(page([1, 2])));

    const result = await getTrendingMovies();

    expect(requestedUrl()).toBe("http://api.test/api/movies/trending");
    expect(result.results.map((movie) => movie.id)).toEqual([1, 2]);
  });

  it("adds ?page= only after the first page", async () => {
    fetchMock.mockImplementation(async () => jsonResponse(page([1])));

    await getPopularMovies(1);
    await getPopularMovies(3);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://api.test/api/movies/popular",
      "http://api.test/api/movies/popular?page=3",
    ]);
  });

  it("turns a 404 into MovieNotFoundError", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "Movie not found." }, 404));

    await expect(getMovieDetails(1)).rejects.toBeInstanceOf(MovieNotFoundError);
  });

  it.each([400, 500, 502])("turns a %i into a plain Error with a friendly message", async (status) => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "raw backend detail" }, status));

    const error = await getMovieDetails(1).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(MovieNotFoundError);
    expect((error as Error).message).toBe("Movie details could not be loaded.");
  });

  it("passes a network failure through", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(getTrendingMovies()).rejects.toThrow("Failed to fetch");
  });

  it("encodes search text and includes the year and page only when set", async () => {
    fetchMock.mockImplementation(async () => jsonResponse(page([])));

    await searchMovies("star wars & more");
    await searchMovies("alien", 1979, 2);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://api.test/api/movies/search?query=star+wars+%26+more",
      "http://api.test/api/movies/search?query=alien&year=1979&page=2",
    ]);
  });

  it("sends only the discover filters that are set", async () => {
    fetchMock.mockResolvedValue(jsonResponse(page([])));

    await discoverMovies({ genreId: 28, minRating: 7.5, year: null }, 2);

    expect(requestedUrl()).toBe("http://api.test/api/movies/discover?genreId=28&minRating=7.5&page=2");
  });

  it("picks with no query string when there are no filters", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1 }));

    await pickMovie({ genreId: null, minRating: null, year: null });

    expect(requestedUrl()).toBe("http://api.test/api/movies/pick");
  });

  it("treats 'nothing matched' on Pick as not found", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "No movie available." }, 404));

    await expect(pickMovie({ genreId: 99, minRating: null, year: null })).rejects.toBeInstanceOf(MovieNotFoundError);
  });

  it("encodes the collection slug", async () => {
    fetchMock.mockResolvedValue(jsonResponse(page([])));

    await getCollectionMovies("a/b", 2);

    expect(requestedUrl()).toBe("http://api.test/api/collections/a%2Fb/movies?page=2");
  });
});
