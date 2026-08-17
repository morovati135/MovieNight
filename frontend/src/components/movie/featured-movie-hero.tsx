"use client";

import type { FocusEvent } from "react";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { Bookmark, ChevronLeft, ChevronRight, Pause, Play, Star } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import { cn } from "@/lib/utils";
import type { FeaturedMovie, MovieSummary } from "@/types/movie";

const autoAdvanceDelay = 7000;

type FeaturedMovieHeroProps = {
  movies: FeaturedMovie[];
  savedMovieIds: Set<number>;
  updatingMovieIds: Set<number>;
  onWatchlistToggle: (movie: MovieSummary) => void;
};

export function FeaturedMovieHero({
  movies,
  onWatchlistToggle,
  savedMovieIds,
  updatingMovieIds,
}: FeaturedMovieHeroProps) {
  const isPointerFocusRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFocusPaused, setIsFocusPaused] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const activeMovie = movies[activeIndex];
  const isPaused = isFocusPaused || isHoverPaused || isUserPaused || isReducedMotion;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setIsReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (isPaused || movies.length < 2) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % movies.length);
    }, autoAdvanceDelay);

    return () => window.clearTimeout(timeoutId);
  }, [activeIndex, isPaused, movies.length]);

  const showSlide = (index: number) => {
    setActiveIndex((index + movies.length) % movies.length);
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocusPaused(false);
    }
  };

  const handleFocus = (event: FocusEvent<HTMLElement>) => {
    if (isPointerFocusRef.current) {
      setIsFocusPaused(false);
      return;
    }

    if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) {
      setIsFocusPaused(true);
    }
  };

  const year = activeMovie.releaseDate?.slice(0, 4);
  const desktopArtwork = activeMovie.backdropUrl ?? activeMovie.posterUrl;
  const compactArtwork = activeMovie.posterUrl ?? activeMovie.backdropUrl;
  const orderedSlides = movies.map((_, order) => {
    const offset = order - 2;
    const index = (activeIndex + offset + movies.length) % movies.length;

    return { index, movie: movies[index], offset };
  });

  return (
    <section
      aria-label="Featured movies"
      aria-roledescription="carousel"
      className="featured-hero relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-background md:min-h-[100svh] lg:min-h-[46rem] xl:min-h-[min(100svh,54rem)]"
      onBlurCapture={handleBlur}
      onFocusCapture={handleFocus}
      onPointerCancelCapture={() => {
        isPointerFocusRef.current = false;
      }}
      onPointerDownCapture={() => {
        isPointerFocusRef.current = true;
      }}
      onPointerUpCapture={() => {
        isPointerFocusRef.current = false;
      }}
    >
      <div
        aria-atomic="true"
        aria-live={isPaused ? "polite" : "off"}
        aria-roledescription="slide"
        className="absolute inset-x-0 top-0 h-[31rem] motion-safe:animate-[hero-reveal_650ms_ease-out] md:h-full"
        key={activeMovie.id}
        role="group"
      >
        {compactArtwork ? (
          <Image
            alt=""
            aria-hidden="true"
            className="object-cover object-[center_18%] lg:hidden"
            fill
            loading="eager"
            sizes="(max-width: 1023px) 100vw, 0px"
            src={compactArtwork}
          />
        ) : null}
        {desktopArtwork ? (
          <Image
            alt=""
            aria-hidden="true"
            className="hidden object-cover object-[center_20%] lg:block"
            fill
            loading="eager"
            sizes="(min-width: 1024px) 100vw, 0px"
            src={desktopArtwork}
          />
        ) : null}
        <div className="hero-image-scrim absolute inset-0" />
      </div>

      <PageContainer className="relative z-10 flex min-h-[calc(100svh-5rem)] items-start pb-6 pt-[29rem] md:min-h-[100svh] md:items-end md:pb-60 md:pt-48 lg:min-h-[46rem] lg:pb-16 lg:pt-40 xl:min-h-[min(100svh,54rem)]">
        <div
          className="max-w-[39rem] space-y-4 motion-safe:animate-[hero-copy-reveal_550ms_ease-out] md:space-y-5 lg:pb-0"
          key={`copy-${activeMovie.id}`}
        >
          <h1 className="max-w-[18ch] text-[2.7rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-white text-balance sm:text-5xl lg:text-[3.35rem]">
            {activeMovie.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm font-semibold text-white/80">
            {year ? <span>{year}</span> : null}
            <span className="inline-flex items-center gap-1.5">
              <Star aria-hidden="true" className="size-4 fill-[#f1d737] text-[#f1d737]" />
              {activeMovie.voteAverage.toFixed(1)}
            </span>
            {activeMovie.genres.slice(0, 2).map((genre) => (
              <span className="before:mr-3 before:text-white/30 before:content-['•']" key={genre.id}>
                {genre.name}
              </span>
            ))}
          </div>

          {activeMovie.overview ? (
            <p className="line-clamp-3 max-w-[38rem] text-sm leading-6 text-white/78 sm:text-base sm:leading-7 lg:line-clamp-2">
              {activeMovie.overview}
            </p>
          ) : null}

          <div className="flex flex-nowrap gap-3 pt-1">
            <Link
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-12 rounded-full border-[#27aaf7] bg-[#149dec] px-5 text-white shadow-[0_10px_32px_rgb(20_157_236/25%)] hover:bg-[#27aaf7] sm:px-6",
              )}
              href={`/movies/${activeMovie.id}`}
            >
              View Details
              <ChevronRight aria-hidden="true" />
            </Link>
            <WatchlistButton
              className="min-h-12 rounded-full border-white/45 bg-[#061126]/65 px-4 text-xs text-white backdrop-blur-md hover:bg-white/12 sm:px-5 sm:text-sm"
              isSaved={savedMovieIds.has(activeMovie.id)}
              isUpdating={updatingMovieIds.has(activeMovie.id)}
              onToggle={() => onWatchlistToggle(activeMovie)}
              title={activeMovie.title}
            />
          </div>
        </div>
      </PageContainer>

      <div
        className="absolute inset-x-4 top-[17.75rem] z-20 md:inset-x-8 md:top-auto md:bottom-5 lg:inset-x-auto lg:right-10 lg:bottom-8 lg:w-[34rem] xl:right-[6vw]"
        onMouseEnter={() => setIsHoverPaused(true)}
        onMouseLeave={() => setIsHoverPaused(false)}
      >
        <div className="relative mx-auto flex h-[6.75rem] max-w-[36rem] items-center justify-center px-8 md:h-[8.5rem] md:px-12">
          <button
            aria-label="Previous featured movie"
            className="absolute left-0 z-40 flex size-11 items-center justify-center rounded-full border border-white/15 bg-[#061126]/78 text-white shadow-[0_10px_30px_rgb(0_0_0/35%)] outline-none backdrop-blur-md transition-colors hover:border-white/35 hover:bg-[#0b1a34] focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => showSlide(activeIndex - 1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>

          <div className="flex min-w-0 items-center justify-center">
            {orderedSlides.map(({ index, movie, offset }, order) => {
              const isActive = offset === 0;
              const isNeighbor = Math.abs(offset) === 1;

              return (
              <button
                aria-label={`Show featured movie ${index + 1}: ${movie.title}`}
                aria-pressed={isActive}
                className={cn(
                  "relative h-[3.75rem] w-[3.75rem] shrink-0 overflow-hidden rounded-xl border bg-surface shadow-[0_12px_30px_rgb(0_0_0/32%)] outline-none transition-[width,height,border-color,opacity,transform,filter] duration-300 ease-out focus-visible:z-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-[5.5rem] md:w-[5.5rem] md:rounded-2xl",
                  order > 0 && "-ml-4 md:-ml-6",
                  isActive
                    ? "z-30 h-[5.75rem] w-[5.75rem] -translate-y-1.5 border-accent opacity-100 shadow-[0_20px_44px_rgb(0_0_0/48%),0_0_0_1px_rgb(41_187_244/22%)] md:h-[8.75rem] md:w-[8.75rem] md:-translate-y-2"
                    : isNeighbor
                      ? "z-20 h-[4.5rem] w-[4.5rem] border-white/25 opacity-90 saturate-100 hover:border-white/55 hover:opacity-100 md:h-[6.75rem] md:w-[6.75rem]"
                      : "z-10 border-white/10 opacity-62 saturate-75 hover:z-40 hover:border-white/45 hover:opacity-100 hover:saturate-100",
                )}
                key={movie.id}
                onClick={() => showSlide(index)}
                type="button"
              >
                {movie.posterUrl ?? movie.backdropUrl ? (
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="object-cover"
                    fill
                    loading="eager"
                    sizes="(max-width: 767px) 92px, 140px"
                    src={(movie.posterUrl ?? movie.backdropUrl)!}
                  />
                ) : (
                  <Bookmark aria-hidden="true" className="absolute inset-0 m-auto size-4 text-white/60" />
                )}
                <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent" />
              </button>
              );
            })}
          </div>

          <button
            aria-label="Next featured movie"
            className="absolute right-0 z-40 flex size-11 items-center justify-center rounded-full border border-white/15 bg-[#061126]/78 text-white shadow-[0_10px_30px_rgb(0_0_0/35%)] outline-none backdrop-blur-md transition-colors hover:border-white/35 hover:bg-[#0b1a34] focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => showSlide(activeIndex + 1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="mt-1 flex items-center justify-center gap-3 md:mt-0 lg:justify-end lg:pr-2">
          <button
            aria-label={
              isReducedMotion
                ? "Automatic rotation disabled by reduced motion preference"
                : isUserPaused
                  ? "Resume featured movie rotation"
                  : "Pause featured movie rotation"
            }
            className="flex size-11 items-center justify-center rounded-full text-white/82 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-45"
            disabled={isReducedMotion}
            onClick={() => setIsUserPaused((current) => !current)}
            type="button"
          >
            {isUserPaused ? (
              <Play aria-hidden="true" className="size-4" />
            ) : (
              <Pause aria-hidden="true" className="size-4" />
            )}
          </button>

          <div aria-hidden="true" className="flex gap-1.5">
            {movies.map((movie, index) => (
              <span
                className={cn(
                  "h-0.5 rounded-full transition-[width,background-color] duration-300",
                  index === activeIndex ? "w-8 bg-accent" : "w-2.5 bg-white/30",
                )}
                key={`indicator-${movie.id}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
