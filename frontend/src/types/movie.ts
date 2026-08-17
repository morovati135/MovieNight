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
