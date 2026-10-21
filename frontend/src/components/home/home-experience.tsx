"use client";

import { useEffect, useMemo, useState } from "react";

import { useSearchParams } from "next/navigation";

import { FeaturedMovieHero } from "@/components/movie/featured-movie-hero";
import { MovieRow } from "@/components/movie/movie-row";
import { SearchExperience } from "@/components/search/search-experience";
import { parseSearchState } from "@/components/search/search-state";
import { useWatchlist } from "@/components/watchlist/use-watchlist";
import { getMovieDetails, getPopularMovies, getTrendingMovies } from "@/lib/api/movies";
import type { FeaturedMovie, MovieSummary } from "@/types/movie";

import { GenreDiscovery } from "./genre-discovery";
import { HomeEmpty, HomeError, HomeLoading, homeSectionsClassName } from "./home-states";
import { PickForMeCta } from "./pick-for-me-cta";
import { WatchlistPreview } from "./watchlist-preview";

type HomeData = {
  featured: FeaturedMovie[];
  popular: MovieSummary[];
  trending: MovieSummary[];
};

export function HomeExperience() {
  const searchParams = useSearchParams();
  const search = useMemo(() => parseSearchState(searchParams), [searchParams]);
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // The Watchlist loads independently so a failure only affects saved state and the preview.
  const {
    retry: handleWatchlistRetry,
    savedMovieIds,
    statusMessage,
    toggle: handleWatchlistToggle,
    updatingMovieIds,
    watchlist,
  } = useWatchlist();

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

  const handleRetry = () => {
    setError(false);
    setData(null);
    setReloadKey((current) => current + 1);
  };

  const watchlistStatus = (
    <p aria-live="polite" className="sr-only" role="status">
      {statusMessage}
    </p>
  );

  // Search replaces the Home sections but shares their Watchlist saved state.
  if (search.isOpen) {
    return (
      <>
        <SearchExperience
          filters={search.filters}
          onWatchlistToggle={handleWatchlistToggle}
          query={search.query}
          savedMovieIds={savedMovieIds}
          updatingMovieIds={updatingMovieIds}
        />
        {watchlistStatus}
      </>
    );
  }

  if (!data && !error) {
    return <HomeLoading />;
  }

  if (error || !data) {
    return <HomeError onRetry={handleRetry} />;
  }

  if (data.featured.length === 0) {
    return <HomeEmpty onRetry={handleRetry} />;
  }

  return (
    <>
      <FeaturedMovieHero
        movies={data.featured}
        onWatchlistToggle={handleWatchlistToggle}
        savedMovieIds={savedMovieIds}
        updatingMovieIds={updatingMovieIds}
      />
      <div className={homeSectionsClassName}>
        <MovieRow
          movies={data.trending}
          onWatchlistToggle={handleWatchlistToggle}
          savedMovieIds={savedMovieIds}
          title="Trending Now"
          updatingMovieIds={updatingMovieIds}
        />
        {data.popular.length > 0 ? (
          <MovieRow
            movies={data.popular}
            onWatchlistToggle={handleWatchlistToggle}
            savedMovieIds={savedMovieIds}
            title="Popular Movies"
            updatingMovieIds={updatingMovieIds}
          />
        ) : null}
        <GenreDiscovery
          onWatchlistToggle={handleWatchlistToggle}
          savedMovieIds={savedMovieIds}
          updatingMovieIds={updatingMovieIds}
        />
        <PickForMeCta />
        <WatchlistPreview
          onRetry={handleWatchlistRetry}
          onWatchlistToggle={handleWatchlistToggle}
          savedMovieIds={savedMovieIds}
          updatingMovieIds={updatingMovieIds}
          watchlist={watchlist}
        />
      </div>
      {watchlistStatus}
    </>
  );
}
