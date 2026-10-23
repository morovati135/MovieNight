"use client";

import type { FocusEvent } from "react";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { Bookmark, ChevronLeft, ChevronRight, Pause, Play, Star } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { glassControlClassName, primaryActionClassName } from "@/components/ui/controls";
import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import { tmdbImageAtSize } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";
import type { FeaturedMovie, MovieSummary } from "@/types/movie";

const autoAdvanceDelay = 7000;

// The same `sizes` as the visible hero images, so preloaded copies are the exact files the slider will use.
const compactSizes = "(max-width: 1023px) 100vw, 0px";
const desktopSizes = "(min-width: 1024px) 100vw, 0px";

/** Full-quality desktop backdrop: TMDB's original, resized by the Next image optimiser for the screen. */
function fullBackdrop(movie: FeaturedMovie) {
  return movie.backdropUrl ? tmdbImageAtSize(movie.backdropUrl, "original") : null;
}

/** Quick desktop backdrop (1280px), shown first and covered by the full-quality one once it loads. */
const desktopArtworkOf = (movie: FeaturedMovie) => movie.backdropUrl ?? movie.posterUrl;
/** Phones and tablets show the poster. */
const compactArtworkOf = (movie: FeaturedMovie) => movie.posterUrl ?? movie.backdropUrl;

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
  // Images that have finished loading, keyed by URL.
  const [loadedImages, setLoadedImages] = useState<Set<string>>(() => new Set());
  // The slide whose artwork is on screen. It only moves to the active slide once that slide's image has
  // loaded, so changing slides cross-fades from the previous backdrop instead of showing a blank hero.
  const [shownIndex, setShownIndex] = useState(0);
  // Slides whose images have been mounted stay mounted (at most six), so a slide shown again is
  // instant and "loaded" always means the image is really there.
  const [mountedSlides, setMountedSlides] = useState<Set<number>>(() => new Set([0]));
  const [mountedFull, setMountedFull] = useState<Set<number>>(() => new Set([0]));
  const [isDesktop, setIsDesktop] = useState(false);
  // The other slides' images start loading only after the first one is on screen, so they never slow it down.
  const [loadOtherSlides, setLoadOtherSlides] = useState(false);
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
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const markLoaded = (url: string) =>
    setLoadedImages((current) => (current.has(url) ? current : new Set(current).add(url)));

  // The artwork a slide needs before it can be shown at this screen size (no artwork counts as ready).
  const readyArtwork = (movie: FeaturedMovie) => (isDesktop ? desktopArtworkOf(movie) : compactArtworkOf(movie));
  const activeArtwork = readyArtwork(activeMovie);
  const isActiveReady = !activeArtwork || loadedImages.has(activeArtwork);

  if (isActiveReady && shownIndex !== activeIndex) {
    setShownIndex(activeIndex);
  }

  // The current slide, then (once the first image is in) its neighbours; full quality for current + next.
  const nextIndex = (activeIndex + 1) % movies.length;
  const previousIndex = (activeIndex - 1 + movies.length) % movies.length;
  const wantedSlides = loadOtherSlides ? [activeIndex, nextIndex, previousIndex] : [activeIndex];
  const wantedFull = loadOtherSlides ? [activeIndex, nextIndex] : [activeIndex];

  if (wantedSlides.some((index) => !mountedSlides.has(index))) {
    setMountedSlides((current) => new Set([...current, ...wantedSlides]));
  }

  if (wantedFull.some((index) => !mountedFull.has(index))) {
    setMountedFull((current) => new Set([...current, ...wantedFull]));
  }

  if (isActiveReady && !loadOtherSlides) {
    setLoadOtherSlides(true);
  }

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
  const orderedSlides = movies.map((_, order) => {
    const offset = order - 2;
    const index = (activeIndex + offset + movies.length) % movies.length;

    return { index, movie: movies[index], offset };
  });

  return (
    <section
      aria-label="Featured movies"
      aria-roledescription="carousel"
      className="featured-hero relative isolate min-h-[44rem] overflow-hidden bg-background md:min-h-[100svh] lg:min-h-[46rem] xl:min-h-[min(100svh,54rem)]"
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
        className="absolute inset-x-0 top-0 h-[31rem] md:h-full"
        role="group"
      >
        {/* One layer per slide; only the shown slide is opaque and switching cross-fades. Images load for the
            current slide first, then its neighbours at low priority, so moving on never shows a blank hero. */}
        {movies.map((movie, index) => {
          const compact = compactArtworkOf(movie);
          const desktop = desktopArtworkOf(movie);
          const full = fullBackdrop(movie);
          const priority = index === activeIndex ? "high" : "low";
          const mountImages = mountedSlides.has(index);
          const mountFull = mountImages && mountedFull.has(index);

          return (
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
                index === shownIndex ? "opacity-100" : "opacity-0",
              )}
              key={movie.id}
            >
              {mountImages && compact ? (
                <Image
                  alt=""
                  className="object-cover object-[center_18%] lg:hidden"
                  fetchPriority={priority}
                  fill
                  loading="eager"
                  onLoad={() => markLoaded(compact)}
                  sizes={compactSizes}
                  src={compact}
                />
              ) : null}
              {mountImages && desktop ? (
                <Image
                  alt=""
                  className="hidden object-cover object-[center_20%] lg:block"
                  fetchPriority={priority}
                  fill
                  loading="eager"
                  onLoad={() => markLoaded(desktop)}
                  sizes={desktopSizes}
                  src={desktop}
                />
              ) : null}
              {mountFull && full ? (
                <Image
                  alt=""
                  className={cn(
                    "hidden object-cover object-[center_20%] transition-opacity duration-500 ease-out motion-reduce:transition-none lg:block",
                    loadedImages.has(full) ? "opacity-100" : "opacity-0",
                  )}
                  fetchPriority="low"
                  fill
                  loading="eager"
                  onLoad={() => markLoaded(full)}
                  sizes={desktopSizes}
                  src={full}
                />
              ) : null}
            </div>
          );
        })}
        <div className="hero-image-scrim absolute inset-0" />
      </div>

      <PageContainer className="relative z-10 flex min-h-[44rem] max-w-none items-start px-4 pb-6 pt-[29rem] lg:px-12 md:min-h-[100svh] md:items-end md:pb-60 md:pt-48 lg:min-h-[46rem] lg:pb-16 lg:pt-40 xl:min-h-[min(100svh,54rem)]">
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
              className={cn(buttonVariants({ size: "lg" }), primaryActionClassName, "px-5 sm:px-6")}
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
            className={cn(glassControlClassName, "absolute left-0 z-40 text-white shadow-[0_10px_30px_rgb(0_0_0/35%)]")}
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
            className={cn(glassControlClassName, "absolute right-0 z-40 text-white shadow-[0_10px_30px_rgb(0_0_0/35%)]")}
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
