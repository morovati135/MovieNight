"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { FeaturedMovieHero } from "@/components/movie/featured-movie-hero";
import { MovieRow } from "@/components/movie/movie-row";
import { getMovieDetails, getPopularMovies, getTrendingMovies } from "@/lib/api/movies";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "@/lib/api/watchlist";
import type { FeaturedMovie, MovieSummary } from "@/types/movie";

import { GenreDiscovery } from "./genre-discovery";
import { HomeEmpty, HomeError, HomeLoading } from "./home-states";
import { PickForMeCta } from "./pick-for-me-cta";
import { WatchlistPreview, type WatchlistState } from "./watchlist-preview";

type HomeData = {
  featured: FeaturedMovie[];
  popular: MovieSummary[];
  trending: MovieSummary[];
};

export function HomeExperience() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [watchlist, setWatchlist] = useState<WatchlistState>({ status: "loading" });
  const [updatingMovieIds, setUpdatingMovieIds] = useState<Set<number>>(new Set());
  const [statusMessage, setStatusMessage] = useState("");
  const [watchlistReloadKey, setWatchlistReloadKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    Promise.all([getTrendingMovies(), getPopularMovies()])
      .then(async ([trending, popular]) => {
        const featuredSummaries = trending.results.slice(0, 6);
        const detailResults = await Promise.allSettled(
          featuredSummaries.map((movie) => getMovieDetails(movie.id)),
        );
        const featured = featuredSummaries.map<FeaturedMovie>((movie, index) => {
          const result = detailResults[index];

          if (result.status === "fulfilled") {
            return {
              ...movie,
              backdropUrl: result.value.backdropUrl,
              genres: result.value.genres,
              overview: result.value.overview ?? movie.overview,
              posterUrl: result.value.posterUrl ?? movie.posterUrl,
            };
          }

          return { ...movie, backdropUrl: null, genres: [] };
        });

        if (isCurrent) {
          setData({
            featured,
            popular: popular.results,
            trending: trending.results,
          });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setError(true);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [reloadKey]);

  // The Watchlist loads independently so a failure only affects saved state and the preview.
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
  }, [watchlistReloadKey]);

  const reloadWatchlist = useCallback(() => {
    setWatchlistReloadKey((current) => current + 1);
  }, []);

  const savedMovieIds = useMemo(
    () => new Set(watchlist.status === "ready" ? watchlist.movies.map((movie) => movie.id) : []),
    [watchlist],
  );

  const handleRetry = () => {
    setError(false);
    setData(null);
    setReloadKey((current) => current + 1);
  };

  const handleWatchlistRetry = () => {
    setWatchlist({ status: "loading" });
    reloadWatchlist();
  };

  const handleWatchlistToggle = useCallback(
    async (movie: MovieSummary) => {
      if (updatingMovieIds.has(movie.id)) {
        return;
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
          reloadWatchlist();
        }

        setStatusMessage(
          wasSaved
            ? `${movie.title} removed from your watchlist.`
            : `${movie.title} added to your watchlist.`,
        );
      } catch {
        setStatusMessage("We couldn't update your watchlist. Please try again.");
      } finally {
        setUpdatingMovieIds((current) => {
          const next = new Set(current);
          next.delete(movie.id);
          return next;
        });
      }
    },
    [reloadWatchlist, savedMovieIds, updatingMovieIds, watchlist.status],
  );

  if (!data && !error) {
    return <HomeLoading />;
  }

  if (error || !data) {
    return (
      <PageContainer>
        <HomeError onRetry={handleRetry} />
      </PageContainer>
    );
  }

  if (data.featured.length === 0) {
    return (
      <PageContainer>
        <HomeEmpty />
      </PageContainer>
    );
  }

  return (
    <>
      <FeaturedMovieHero
        movies={data.featured}
        onWatchlistToggle={handleWatchlistToggle}
        savedMovieIds={savedMovieIds}
        updatingMovieIds={updatingMovieIds}
      />
      <div className="h2-rails-ambient w-full space-y-4 overflow-x-clip px-4 pt-10 pb-14 sm:space-y-20 sm:px-8 sm:pt-16 sm:pb-20 lg:space-y-24 lg:px-12 lg:pt-20 lg:pb-24">
        <MovieRow
          movies={data.trending}
          onWatchlistToggle={handleWatchlistToggle}
          savedMovieIds={savedMovieIds}
          title="Trending Now"
          updatingMovieIds={updatingMovieIds}
        />
        <MovieRow
          movies={data.popular}
          onWatchlistToggle={handleWatchlistToggle}
          savedMovieIds={savedMovieIds}
          title="Popular Movies"
          updatingMovieIds={updatingMovieIds}
        />
        <GenreDiscovery
          onWatchlistToggle={handleWatchlistToggle}
          savedMovieIds={savedMovieIds}
          updatingMovieIds={updatingMovieIds}
        />
        <div className="pt-10 sm:pt-4">
          <PickForMeCta />
        </div>
        <WatchlistPreview
          onRetry={handleWatchlistRetry}
          onWatchlistToggle={handleWatchlistToggle}
          savedMovieIds={savedMovieIds}
          updatingMovieIds={updatingMovieIds}
          watchlist={watchlist}
        />
      </div>
      <p aria-live="polite" className="sr-only" role="status">
        {statusMessage}
      </p>
    </>
  );
}
