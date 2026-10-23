import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { Genre, MovieCollection, MovieDetails, MovieSummary, PagedMovieResult } from "@/types/movie";

// The backend test ApiContractTests checks the real API against this same file.
const shapes = JSON.parse(readFileSync(resolve(__dirname, "../../../../contracts/api-shapes.json"), "utf8")) as Record<
  string,
  string[]
>;

// Each record lists every key of the TypeScript type: a missing or extra key is a compile error.
const typeKeys = {
  Cast: { character: true, id: true, name: true, order: true, profileUrl: true } satisfies Record<
    keyof MovieDetails["cast"][number],
    true
  >,
  Genre: { id: true, name: true } satisfies Record<keyof Genre, true>,
  MovieCollection: { posterUrls: true, slug: true, title: true } satisfies Record<keyof MovieCollection, true>,
  MovieDetails: {
    backdropUrl: true,
    cast: true,
    directors: true,
    genres: true,
    id: true,
    overview: true,
    posterUrl: true,
    productionCountryCodes: true,
    releaseDate: true,
    runtimeMinutes: true,
    sceneImageUrls: true,
    similarMovies: true,
    title: true,
    voteAverage: true,
  } satisfies Record<keyof MovieDetails, true>,
  MovieSummary: {
    backdropUrl: true,
    genreIds: true,
    id: true,
    overview: true,
    posterUrl: true,
    releaseDate: true,
    title: true,
    voteAverage: true,
  } satisfies Record<keyof MovieSummary, true>,
  PagedMovieResult: { page: true, results: true, totalPages: true, totalResults: true } satisfies Record<
    keyof PagedMovieResult,
    true
  >,
  Person: { id: true, name: true, profileUrl: true } satisfies Record<keyof MovieDetails["directors"][number], true>,
};

describe("API contract", () => {
  it.each(Object.entries(typeKeys))("%s: the TypeScript type has the same keys as the API", (name, keys) => {
    expect(Object.keys(keys).sort()).toEqual([...shapes[name]].sort());
  });

  it("describes every shape the types cover", () => {
    const documented = Object.keys(shapes).filter((name) => !name.startsWith("_"));

    expect(documented.sort()).toEqual(Object.keys(typeKeys).sort());
  });
});
