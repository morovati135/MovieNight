"use client";

import { useEffect, useMemo, useState } from "react";

import { useSearchParams } from "next/navigation";

import { FeaturedMovieHero } from "@/components/movie/featured-movie-hero";
import { MovieRow } from "@/components/movie/movie-row";
import { SearchExperience } from "@/components/search/search-experience";
import { parseSearchState } from "@/components/search/search-state";
import { useWatchlist } from "@/components/watchlist/use-watchlist";
import { getGenres, getPopularMovies, getTrendingMovies } from "@/lib/api/movies";
import type { FeaturedMovie, MovieSummary } from "@/types/movie";

import { CollectionsSection } from "./collections-section";
import { GenreDiscovery } from "./genre-discovery";
import { HomeEmpty, HomeError, HomeLoading, homeSectionsClassName } from "./home-states";
import { IconicSection } from "./iconic-section";
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

    // One parallel round: the hero is built from the trending list itself (backdrop from the summary, D029)
    // and genre names, instead of waiting for six full Movie Details requests. Genres are optional.
    Promise.all([getTrendingMovies(), getPopularMovies(), getGenres().catch(() => [])])
      .then(([trending, popular, genres]) => {
        const genreNames = new Map(genres.map((genre) => [genre.id, genre]));
        const featured = trending.results.slice(0, 6).map<FeaturedMovie>((movie) => ({
          ...movie,
          backdropUrl: movie.backdropUrl ?? null,
          genres: movie.genreIds.flatMap((id) => {
            const genre = genreNames.get(id);
            return genre ? [genre] : [];
          }),
        }));

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

  // Search is a view of Home; give it its own tab title while it is open.
  useEffect(() => {
    if (!search.isOpen) {
      return;
    }

    const previousTitle = document.title;
    document.title = "Search · MovieNight";

    return () => {
      document.title = previousTitle;
    };
  }, [search.isOpen]);

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
          moreHref="/browse/trending"
          moreLabel="See more"
          movies={data.trending}
          onWatchlistToggle={handleWatchlistToggle}
          savedMovieIds={savedMovieIds}
          title="Trending Now"
          updatingMovieIds={updatingMovieIds}
        />
        {data.popular.length > 0 ? (
          <MovieRow
            moreHref="/browse/popular"
            moreLabel="See more"
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
        <CollectionsSection />
        <IconicSection
          onWatchlistToggle={handleWatchlistToggle}
          savedMovieIds={savedMovieIds}
          updatingMovieIds={updatingMovieIds}
        />
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
