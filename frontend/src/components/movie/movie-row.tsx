import type { MovieSummary } from "@/types/movie";

import { MovieCard } from "./movie-card";

type MovieRowProps = {
  movies: MovieSummary[];
  savedMovieIds: Set<number>;
  updatingMovieIds: Set<number>;
  onWatchlistToggle: (movie: MovieSummary) => void;
};

export function MovieRow({
  movies,
  onWatchlistToggle,
  savedMovieIds,
  updatingMovieIds,
}: MovieRowProps) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
      <div className="grid auto-cols-[42vw] grid-flow-col gap-3 sm:auto-cols-[11.75rem] lg:auto-cols-[10.75rem]">
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
    </div>
  );
}
