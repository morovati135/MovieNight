import type { MovieSummary } from "@/types/movie";

import { MovieCard } from "./movie-card";

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
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
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
