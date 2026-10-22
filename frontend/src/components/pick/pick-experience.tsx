"use client";

import { type ReactNode, type Ref, useEffect, useMemo, useRef, useState } from "react";

import { ResilientImage } from "@/components/ui/resilient-image";

import { useRouter, useSearchParams } from "next/navigation";

import { RotateCcw, Shuffle, Sparkles } from "lucide-react";
import { useReducedMotion } from "motion/react";

import { MovieRow } from "@/components/movie/movie-row";
import { earliestReleaseYear, latestReleaseYear } from "@/components/search/search-state";
import { AnimatedRays } from "@/components/ui/effects/animated-rays";
import { FlipFadeText } from "@/components/ui/effects/flip-fade-text";
import { MagneticSpotlightMarquee } from "@/components/ui/effects/magnetic-spotlight-marquee";
import { HaloButton } from "@/components/ui/halo/halo-button";
import { HaloOrb, HaloPrompt } from "@/components/ui/halo/halo-prompt";
import { HaloSelect } from "@/components/ui/halo/halo-select";
import { HaloToggleGroup } from "@/components/ui/halo/halo-toggle-group";
import { useWatchlist } from "@/components/watchlist/use-watchlist";
import { discoverMovies, getGenres, getPopularMovies } from "@/lib/api/movies";
import { cn } from "@/lib/utils";
import type { Genre, MovieSummary } from "@/types/movie";

import { PickSearching } from "./pick-searching";
import { PickSpotlight, spotlightFrameClassName } from "./pick-spotlight";
import { describePick, parsePickFilters, type PickFilters, pickHref, pickRatingOptions } from "./pick-state";
import { usePick } from "./use-pick";

type GenreList = { status: "loading" } | { status: "error" } | { status: "ready"; genres: Genre[] };

const anyValue = "any";

const yearItems = [
  { label: "Any year", value: anyValue },
  ...Array.from({ length: latestReleaseYear - earliestReleaseYear + 1 }, (_, index) => {
    const year = (latestReleaseYear - index).toString();

    return { label: year, value: year };
  }),
];

// Short visible labels with a full name for screen readers.
const ratingItems = [
  { label: <RatingLabel full="Any rating" short="Any" />, value: anyValue },
  ...pickRatingOptions.map((rating) => ({
    label: <RatingLabel full={`${rating} or higher`} short={`${rating}+`} />,
    value: rating.toString(),
  })),
];

function RatingLabel({ full, short }: { full: string; short: string }) {
  return (
    <>
      <span aria-hidden="true">{short}</span>
      <span className="sr-only">{full}</span>
    </>
  );
}

const moodWords = ["a thriller.", "a comedy.", "a love story.", "sci-fi.", "a mystery.", "an adventure."];

const toValue = (value: number | null) => (value === null ? anyValue : value.toString());
const fromValue = (value: string) => (value === anyValue ? null : Number(value));

const controlLabelClassName = "px-1 text-xs font-bold tracking-[0.14em] text-white/55 uppercase";
const choiceButtonClassName =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-white/18 bg-white/6 px-5 text-sm font-bold text-white backdrop-blur-md outline-none transition-colors hover:border-white/30 hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-ring";

/** Status lines for the search; each one describes something the search really does. */
function searchSteps(filters: PickFilters, genreName: string | null) {
  return [
    "Looking through popular movies",
    genreName ? `Keeping only ${genreName}` : null,
    filters.year !== null ? `Released in ${filters.year}` : null,
    filters.minRating !== null ? `Rated ${filters.minRating} and up` : null,
    "Getting the poster ready",
  ].filter((step): step is string => step !== null);
}

/** e.g. "Thriller movies from 2019 rated 7+": the current choices in words. */
function describeChoices(filters: PickFilters, genreName: string | null) {
  const subject = !genreName ? "movies" : /movie$/i.test(genreName) ? `${genreName}s` : `${genreName} movies`;
  const year = filters.year !== null ? ` from ${filters.year}` : "";
  const rating = filters.minRating !== null ? ` rated ${filters.minRating}+` : "";

  return `${subject}${year}${rating}`;
}

/** One button per active choice: each drops (or lowers) just that choice. */
function looseningOptions(filters: PickFilters, genreName: string | null) {
  const options: Array<{ label: string; filters: PickFilters }> = [];

  if (filters.minRating !== null) {
    const lower = pickRatingOptions.filter((rating) => rating < filters.minRating!).at(-1) ?? null;
    options.push({ filters: { ...filters, minRating: lower }, label: lower === null ? "Any rating" : `Rated ${lower}+ instead` });
  }

  if (filters.year !== null) {
    options.push({ filters: { ...filters, year: null }, label: `Any year, not just ${filters.year}` });
  }

  if (filters.genreId !== null) {
    options.push({ filters: { ...filters, genreId: null }, label: genreName ? `Any genre, not just ${genreName}` : "Any genre" });
  }

  return options;
}

export function PickExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parsePickFilters(searchParams);
  const reduceMotion = useReducedMotion() ?? false;
  const [genres, setGenres] = useState<GenreList>({ status: "loading" });
  const [popular, setPopular] = useState<MovieSummary[]>([]);
  // Posters of movies matching the current choices, shuffled while the search runs.
  const [matchingPosterUrls, setMatchingPosterUrls] = useState<string[]>([]);
  const { markArtworkReady, markPosterFailed, pick, state } = usePick();
  const { savedMovieIds, statusMessage, toggle, updatingMovieIds } = useWatchlist();
  const stageRef = useRef<HTMLDivElement>(null);
  const pickedHeadingRef = useRef<HTMLHeadingElement>(null);
  const noticeHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let isCurrent = true;

    getGenres()
      .then((genreList) => isCurrent && setGenres({ genres: genreList, status: "ready" }))
      .catch(() => isCurrent && setGenres({ status: "error" }));
    // Popular movies only decorate the page (marquee, search shuffle, suggestions); a failure hides them.
    getPopularMovies()
      .then((page) => isCurrent && setPopular(page.results))
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, []);

  const resultId = state.status === "result" ? state.picked.movie.id : null;
  const isNotice = state.status === "no-match" || state.status === "error";

  // Same for the no-match and error notices.
  useEffect(() => {
    if (isNotice) {
      noticeHeadingRef.current?.focus({ preventScroll: true });
    }
  }, [isNotice, state]);

  // Move focus to the result so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (resultId !== null) {
      pickedHeadingRef.current?.focus({ preventScroll: true });
    }
  }, [resultId]);

  const genreList = genres.status === "ready" ? genres.genres : [];
  const genreName = filters.genreId !== null ? (genreList.find((genre) => genre.id === filters.genreId)?.name ?? null) : null;
  const genreItems = [
    { label: genres.status === "error" ? "Any genre (list unavailable)" : "Any genre", value: anyValue },
    ...genreList.map((genre) => ({ label: genre.name, value: genre.id.toString() })),
  ];
  const posters = popular.filter((movie) => movie.posterUrl);
  const posterUrls = posters.map((movie) => movie.posterUrl!);
  // Stable between renders so the top strip's loop is not restarted.
  const marqueeImages = useMemo(
    () => popular.flatMap((movie) => (movie.posterUrl ? [{ key: movie.id, src: movie.posterUrl }] : [])).slice(0, 14),
    [popular],
  );

  const setFilters = (next: PickFilters) => {
    router.replace(pickHref(next), { scroll: false });
  };

  const runPick = (choices: PickFilters = filters) => {
    void pick(choices);
    setMatchingPosterUrls([]);
    discoverMovies(choices)
      .then((page) => setMatchingPosterUrls(page.results.flatMap((movie) => (movie.posterUrl ? [movie.posterUrl] : []))))
      .catch(() => undefined);
    // Bring the stage into view; the search plays there.
    window.requestAnimationFrame(() =>
      stageRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }),
    );
  };

  /** Drops or lowers one choice and searches again straight away. */
  const loosen = (next: PickFilters) => {
    setFilters(next);
    runPick(next);
  };

  const isSearching = state.status === "searching";
  const picked = state.status === "result" ? state.picked : null;
  const suggestions =
    picked && picked.details && picked.details.similarMovies.length > 0
      ? { movies: picked.details.similarMovies, title: `More like ${picked.movie.title}` }
      : popular.length > 0
        ? { movies: popular, title: "Popular right now" }
        : null;

  return (
    <div className="relative isolate flex flex-1 flex-col overflow-x-clip">
      <MagneticSpotlightMarquee
        background={<AnimatedRays />}
        className="pt-28 pb-10 md:pt-36 md:pb-12"
        images={marqueeImages}
      >
        <header className="mx-auto mb-10 max-w-4xl px-4 text-center sm:px-8 md:mb-12">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] text-white/80 uppercase sm:text-[0.8125rem]">
            <Sparkles aria-hidden="true" className="size-3.5 fill-current" />
            Pick for Me
          </p>
          <h1 className="mt-4 text-[2.5rem] leading-[1.02] font-extrabold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
            <span className="block">Tonight feels like</span>
            <span className="block">
              <FlipFadeText className="min-h-[1.1em]" interval={2600} label="something good." textClassName="text-white" words={moodWords} />
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/72 sm:text-base sm:leading-7">
            Choose a genre, a year and a rating, or leave them open. MovieNight picks one popular movie that fits.
          </p>
        </header>
      </MagneticSpotlightMarquee>

      <section aria-label="Your choices" className="relative z-10 mx-auto w-full max-w-[52rem] px-4 sm:px-8">
        <HaloPrompt busy={isSearching} busyText="Looking through popular movies that fit…" text={describePick(filters, genreName)} />

        <div className="mt-6 grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <HaloSelect
            disabled={genres.status !== "ready"}
            items={genreItems}
            label="Genre"
            onValueChange={(value) => setFilters({ ...filters, genreId: fromValue(value) })}
            value={genres.status === "ready" ? toValue(filters.genreId) : anyValue}
          />
          <HaloSelect
            items={yearItems}
            label="Release year"
            onValueChange={(value) => setFilters({ ...filters, year: fromValue(value) })}
            value={toValue(filters.year)}
          />
          <div className="flex min-w-0 flex-col gap-2">
            <span className={controlLabelClassName} id="pick-rating-label">
              Minimum rating
            </span>
            <div aria-labelledby="pick-rating-label" role="group">
              <HaloToggleGroup
                className="w-full [&>div:last-child]:w-full"
                items={ratingItems}
                onValueChange={(value) => setFilters({ ...filters, minRating: fromValue(value) })}
                value={toValue(filters.minRating)}
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-col justify-end">
            <HaloButton
              className="w-full"
              icon={<Shuffle aria-hidden="true" />}
              isLoading={isSearching}
              loadingText="Picking…"
              onClick={() => runPick()}
            >
              {picked ? "Pick again" : "Pick a movie"}
            </HaloButton>
          </div>
        </div>
      </section>

      <p aria-live="polite" className="sr-only">
        {statusMessage}
      </p>

      <div className="mx-auto w-full max-w-[77rem] scroll-mt-28 px-4 sm:px-8" ref={stageRef}>
        {state.status === "searching" ? (
          <div className="relative mt-12 sm:mt-16">
            <PickSearching posterUrls={matchingPosterUrls.length >= 3 ? matchingPosterUrls : posterUrls} steps={searchSteps(filters, genreName)} />
            {state.candidate ? (
              <PickSpotlight
                genres={genreList}
                hidden
                isSaved={false}
                isUpdating={false}
                key={state.candidate.movie.id}
                onArtworkReady={markArtworkReady}
                onPosterFailed={markPosterFailed}
                onPickAgain={() => runPick()}
                onToggleWatchlist={() => undefined}
                picked={state.candidate}
              />
            ) : null}
          </div>
        ) : null}

        {picked ? (
          <div className="mt-12 sm:mt-16">
            <p className="sr-only" role="status">
              Picked: {picked.movie.title}.
            </p>
            <PickSpotlight
              genres={genreList}
              headingRef={pickedHeadingRef}
              isSaved={savedMovieIds.has(picked.movie.id)}
              isUpdating={updatingMovieIds.has(picked.movie.id)}
              key={picked.movie.id}
              onPickAgain={() => runPick()}
              onToggleWatchlist={() => void toggle(picked.movie)}
              picked={picked}
            />
          </div>
        ) : null}

        {state.status === "no-match" ? (
          <PickNotice headingRef={noticeHeadingRef} posterUrls={posterUrls} title="Nothing fits all of that.">
            <p>
              No popular movie matches {describeChoices(filters, genreName)}. Loosen one choice and we’ll look again.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {looseningOptions(filters, genreName).map((option) => (
                <button className={choiceButtonClassName} key={option.label} onClick={() => loosen(option.filters)} type="button">
                  {option.label}
                </button>
              ))}
              <button className={choiceButtonClassName} onClick={() => loosen({ genreId: null, minRating: null, year: null })} type="button">
                <RotateCcw aria-hidden="true" className="size-4" />
                Start over with any movie
              </button>
            </div>
          </PickNotice>
        ) : null}

        {state.status === "error" ? (
          <PickNotice headingRef={noticeHeadingRef} posterUrls={posterUrls} role="alert" title="We couldn’t pick a movie right now.">
            <p>We couldn’t reach the movie service. Your choices are kept, so try again in a moment.</p>
            <div className="mt-6 flex justify-center">
              <button className={choiceButtonClassName} onClick={() => runPick()} type="button">
                <RotateCcw aria-hidden="true" className="size-4" />
                Try again
              </button>
            </div>
          </PickNotice>
        ) : null}
      </div>

      {suggestions ? (
        <div className="mx-auto mt-16 w-full max-w-[77rem] px-5 pb-16 sm:mt-20 sm:px-8 lg:px-12 lg:pb-24">
          <MovieRow
            cardVariant="landscape"
            movies={suggestions.movies}
            onWatchlistToggle={(movie) => void toggle(movie)}
            savedMovieIds={savedMovieIds}
            title={suggestions.title}
            updatingMovieIds={updatingMovieIds}
          />
        </div>
      ) : (
        <div className="pb-16 lg:pb-24" />
      )}
    </div>
  );
}

function PickNotice({
  children,
  headingRef,
  posterUrls,
  role,
  title,
}: {
  children: ReactNode;
  headingRef: Ref<HTMLHeadingElement>;
  posterUrls: string[];
  role?: "alert";
  title: string;
}) {
  return (
    <div className={cn(spotlightFrameClassName, "mt-12 sm:mt-16")} role={role}>
      {/* A dim fan of popular posters keeps the stage cinematic without suggesting a result. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 flex items-center justify-center gap-4 opacity-25 blur-md">
        {posterUrls.slice(0, 5).map((url, index) => (
          <div
            className={cn("relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-2xl sm:w-40", index % 2 === 1 && "translate-y-6")}
            key={url}
          >
            <ResilientImage alt="" className="object-cover" fill sizes="200px" src={url} />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgb(3_10_27/72%),#030a1b_100%)]" />
      <div className="flex flex-col items-center px-6 py-14 text-center sm:py-20">
        <HaloOrb className="size-14" />
        <h2 className="mt-6 text-2xl font-extrabold tracking-[-0.035em] text-white outline-none sm:text-3xl" ref={headingRef} tabIndex={-1}>
          {title}
        </h2>
        <div className="mt-3 max-w-lg text-sm leading-6 text-white/72 sm:text-base sm:leading-7">{children}</div>
      </div>
    </div>
  );
}
