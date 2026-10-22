"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { addToWatchlist, getWatchlist, removeFromWatchlist } from "@/lib/api/watchlist";
import type { MovieSummary } from "@/types/movie";

export type WatchlistState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; movies: MovieSummary[] };

/**
 * Anonymous Watchlist for the current page: loads it once, derives saved movie IDs, and adds/removes movies.
 * A failure only affects saved state; `statusMessage` announces each change for screen readers.
 */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingMovieIds, setUpdatingMovieIds] = useState<Set<number>>(new Set());
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    getWatchlist()
      .then((movies) => {
        if (isCurrent) {
          setWatchlist({ movies, status: "ready" });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setWatchlist({ status: "error" });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const retry = useCallback(() => {
    setWatchlist({ status: "loading" });
    reload();
  }, [reload]);

  const savedMovieIds = useMemo(
    () => new Set(watchlist.status === "ready" ? watchlist.movies.map((movie) => movie.id) : []),
    [watchlist],
  );

  /** Adds or removes `movie`; resolves to whether the change was saved. */
  const toggle = useCallback(
    async (movie: MovieSummary): Promise<boolean> => {
      if (updatingMovieIds.has(movie.id)) {
        return false;
      }

      const wasSaved = savedMovieIds.has(movie.id);
      setUpdatingMovieIds((current) => new Set(current).add(movie.id));
      setStatusMessage("");

      try {
        if (wasSaved) {
          await removeFromWatchlist(movie.id);
        } else {
          await addToWatchlist(movie.id);
        }

        if (watchlist.status === "ready") {
          setWatchlist((current) =>
            current.status === "ready"
              ? {
                  movies: wasSaved
                    ? current.movies.filter((savedMovie) => savedMovie.id !== movie.id)
                    : [movie, ...current.movies],
                  status: "ready",
                }
              : current,
          );
        } else {
          // Saved state was unknown, so rehydrate from the backend instead of guessing.
          reload();
        }

        setStatusMessage(
          wasSaved
            ? `${movie.title} removed from your watchlist.`
            : `${movie.title} added to your watchlist.`,
        );
        return true;
      } catch {
        setStatusMessage("We couldn't update your watchlist. Please try again.");
        return false;
      } finally {
        setUpdatingMovieIds((current) => {
          const next = new Set(current);
          next.delete(movie.id);
          return next;
        });
      }
    },
    [reload, savedMovieIds, updatingMovieIds, watchlist.status],
  );

  return { retry, savedMovieIds, statusMessage, toggle, updatingMovieIds, watchlist };
}
