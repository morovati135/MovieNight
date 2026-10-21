import type { MovieSummary } from "@/types/movie";

import { MovieCard } from "./movie-card";

// Poster density matches the Home rails: two posters on mobile, four on tablet, six on wide desktop.
export const movieGridClassName =
  "grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-11 xl:grid-cols-6";

type MovieGridProps = {
  movies: MovieSummary[];
  savedMovieIds: Set<number>;
  updatingMovieIds: Set<number>;
  onWatchlistToggle: (movie: MovieSummary) => void;
};

export function MovieGrid({
  movies,
  onWatchlistToggle,
  savedMovieIds,
  updatingMovieIds,
}: MovieGridProps) {
  return (
    <div className={movieGridClassName}>
      {movies.map((movie) => (
        <MovieCard
          isSaved={savedMovieIds.has(movie.id)}
          isUpdating={updatingMovieIds.has(movie.id)}
          key={movie.id}
          movie={movie}
          onWatchlistToggle={onWatchlistToggle}
        />
      ))}
    </div>
  );
}
