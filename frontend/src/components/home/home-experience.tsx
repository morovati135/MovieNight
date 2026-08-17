"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { FeaturedMovieHero } from "@/components/movie/featured-movie-hero";
import { MovieRow } from "@/components/movie/movie-row";
import { getMovieDetails, getPopularMovies, getTrendingMovies } from "@/lib/api/movies";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "@/lib/api/watchlist";
import type { FeaturedMovie, MovieSummary } from "@/types/movie";

import { HomeEmpty, HomeError, HomeLoading } from "./home-states";

type HomeData = {
  featured: FeaturedMovie[];
  popular: MovieSummary[];
  trending: MovieSummary[];
  watchlist: MovieSummary[];
};

export function HomeExperience() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingMovieIds, setUpdatingMovieIds] = useState<Set<number>>(new Set());
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    Promise.all([getTrendingMovies(), getPopularMovies(), getWatchlist()])
      .then(async ([trending, popular, watchlist]) => {
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
            watchlist,
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

  const savedMovieIds = useMemo(
    () => new Set(data?.watchlist.map((movie) => movie.id) ?? []),
    [data?.watchlist],
  );

  const handleRetry = () => {
    setError(false);
    setData(null);
    setReloadKey((current) => current + 1);
  };

  const handleWatchlistToggle = useCallback(
    async (movie: MovieSummary) => {
      if (!data || updatingMovieIds.has(movie.id)) {
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

        setData((current) =>
          current
            ? {
                ...current,
                watchlist: wasSaved
                  ? current.watchlist.filter((savedMovie) => savedMovie.id !== movie.id)
                  : [movie, ...current.watchlist],
              }
            : current,
        );
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
    [data, savedMovieIds, updatingMovieIds],
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
      </div>
      <p aria-live="polite" className="sr-only" role="status">
        {statusMessage}
      </p>
    </>
  );
}
