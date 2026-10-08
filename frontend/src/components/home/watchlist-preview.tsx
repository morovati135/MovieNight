import { MovieRow } from "@/components/movie/movie-row";
import type { MovieSummary } from "@/types/movie";

export type WatchlistState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; movies: MovieSummary[] };

type WatchlistPreviewProps = {
  watchlist: WatchlistState;
  savedMovieIds: Set<number>;
  updatingMovieIds: Set<number>;
  onRetry: () => void;
  onWatchlistToggle: (movie: MovieSummary) => void;
};

export function WatchlistPreview({
  onRetry,
  onWatchlistToggle,
  savedMovieIds,
  updatingMovieIds,
  watchlist,
}: WatchlistPreviewProps) {
  if (watchlist.status === "error") {
    return (
      <section aria-labelledby="watchlist-preview-heading" className="pt-14 sm:pt-8 lg:pt-6">
        <h2
          className="text-2xl font-extrabold tracking-[-0.035em] text-white sm:text-3xl lg:text-5xl"
          id="watchlist-preview-heading"
        >
          Your Watchlist
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/72 sm:mt-6" role="alert">
          <span>Your watchlist could not be loaded right now.</span>
          <button
            className="min-h-11 rounded-lg px-2 font-bold text-[#41bfff] outline-none hover:text-[#72d1ff] focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onRetry}
            type="button"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (watchlist.status === "loading" || watchlist.movies.length === 0) {
    return null;
  }

  return (
    <div className="pt-14 sm:pt-8 lg:pt-6">
      <MovieRow
        moreHref="/watchlist"
        moreLabel="View Watchlist"
        movies={watchlist.movies.slice(0, 8)}
        onWatchlistToggle={onWatchlistToggle}
        savedMovieIds={savedMovieIds}
        title="Your Watchlist"
        updatingMovieIds={updatingMovieIds}
      />
    </div>
  );
}
