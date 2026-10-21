import { sectionTitleClassName } from "@/components/layout/section-heading";
import { MovieRow } from "@/components/movie/movie-row";
import type { MovieSummary } from "@/types/movie";

import { SectionNotice } from "./home-states";

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
      <section aria-labelledby="watchlist-preview-heading">
        <div className="mb-4 flex min-h-11 items-center sm:mb-7">
          <h2 className={sectionTitleClassName} id="watchlist-preview-heading">
            Your Watchlist
          </h2>
        </div>
        <SectionNotice onAction={onRetry}>Your watchlist could not be loaded right now.</SectionNotice>
      </section>
    );
  }

  if (watchlist.status === "loading" || watchlist.movies.length === 0) {
    return null;
  }

  return (
    <MovieRow
      moreHref="/watchlist"
      moreLabel="View Watchlist"
      movies={watchlist.movies.slice(0, 8)}
      onWatchlistToggle={onWatchlistToggle}
      savedMovieIds={savedMovieIds}
      title="Your Watchlist"
      updatingMovieIds={updatingMovieIds}
    />
  );
}
