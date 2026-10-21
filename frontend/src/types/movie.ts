export type Genre = {
  id: number;
  name: string;
};

export type MovieSummary = {
  id: number;
  title: string;
  overview: string | null;
  releaseDate: string | null;
  genreIds: number[];
  posterUrl: string | null;
  voteAverage: number;
};

export type MovieDetails = Omit<MovieSummary, "genreIds"> & {
  genres: Genre[];
  runtimeMinutes: number;
  backdropUrl: string | null;
  cast: Array<{
    id: number;
    name: string;
    character: string | null;
    order: number;
    profileUrl: string | null;
  }>;
  similarMovies: MovieSummary[];
  directors: Array<{
    id: number;
    name: string;
    profileUrl: string | null;
  }>;
  /** ISO 3166-1 codes, e.g. "US". */
  productionCountryCodes: string[];
  /** Text-free scene images (TMDB backdrops), excluding the hero backdrop. */
  sceneImageUrls: string[];
};

export type FeaturedMovie = MovieSummary & {
  backdropUrl: string | null;
  genres: Genre[];
};

export type PagedMovieResult = {
  results: MovieSummary[];
  page: number;
  totalPages: number;
  totalResults: number;
};
