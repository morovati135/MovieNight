"use client";

import { type ReactNode, type Ref, useEffect, useRef, useState } from "react";

import Link from "next/link";

import { Bookmark, Compass, LockKeyhole, RotateCcw, Shuffle, Undo2, X } from "lucide-react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";

import { MovieCard } from "@/components/movie/movie-card";
import { movieGridClassName } from "@/components/movie/movie-grid";
import { buttonVariants } from "@/components/ui/button";
import { primaryActionClassName } from "@/components/ui/controls";
import { FloatingAnimation } from "@/components/ui/effects/floating-animation";
import { MorphText } from "@/components/ui/effects/morph-text";
import { cn } from "@/lib/utils";
import type { MovieSummary } from "@/types/movie";

import { useWatchlist } from "./use-watchlist";

/** How long "Removed … · Undo" stays on screen. */
const undoWindowMs = 5000;

const secondaryActionClassName =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/18 bg-white/6 px-6 text-sm font-bold text-white backdrop-blur-md outline-none transition-colors hover:border-white/30 hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-ring";

function savedCountLabel(count: number) {
  return count === 1 ? "1 movie waiting for movie night" : `${count} movies waiting for movie night`;
}

export function WatchlistExperience() {
  const { retry, statusMessage, toggle, updatingMovieIds, watchlist, savedMovieIds } = useWatchlist();
  const [removed, setRemoved] = useState<MovieSummary | null>(null);
  const undoTimerRef = useRef<number | null>(null);
  const undoButtonRef = useRef<HTMLButtonElement>(null);
  const emptyHeadingRef = useRef<HTMLHeadingElement>(null);
  /** Where keyboard focus should go once the removed card is gone (null: focus was elsewhere). */
  const focusPlanRef = useRef<{ index: number } | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const movies = watchlist.status === "ready" ? watchlist.movies : [];

  useEffect(
    () => () => {
      if (undoTimerRef.current) {
        window.clearTimeout(undoTimerRef.current);
      }
    },
    [],
  );

  /** Moves focus to the shelf slot `index` (its Remove button), or to the empty-shelf heading. */
  const focusShelfSlot = (index: number) => {
    window.requestAnimationFrame(() => {
      const buttons = document.querySelectorAll<HTMLButtonElement>("[data-remove-button]");
      const target = buttons[Math.min(index, buttons.length - 1)];
      (target ?? emptyHeadingRef.current)?.focus();
    });
  };

  const closeUndo = () => {
    setRemoved(null);

    // Focus was on Undo: keep it in the shelf instead of letting it drop to the top of the page.
    if (focusPlanRef.current && document.activeElement === undoButtonRef.current) {
      focusShelfSlot(focusPlanRef.current.index);
    }

    focusPlanRef.current = null;
  };

  const remove = async (movie: MovieSummary) => {
    const card = document.querySelector(`[data-movie-id="${movie.id}"]`);
    const hadFocus = card?.contains(document.activeElement) ?? false;
    const index = movies.findIndex((saved) => saved.id === movie.id);

    if (!(await toggle(movie))) {
      return;
    }

    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
    }

    focusPlanRef.current = hadFocus ? { index } : null;
    setRemoved(movie);
    undoTimerRef.current = window.setTimeout(closeUndo, undoWindowMs);
  };

  // A keyboard removal hands focus to Undo, the natural next action.
  useEffect(() => {
    if (removed && focusPlanRef.current) {
      undoButtonRef.current?.focus();
    }
  }, [removed]);

  const undo = async () => {
    if (!removed) {
      return;
    }

    const movie = removed;
    const returnFocus = focusPlanRef.current !== null;
    focusPlanRef.current = null;
    setRemoved(null);

    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
    }

    if ((await toggle(movie)) && returnFocus) {
      window.requestAnimationFrame(() =>
        document.querySelector<HTMLButtonElement>(`[data-movie-id="${movie.id}"] [data-remove-button]`)?.focus(),
      );
    }
  };

  // Cards toggle the Watchlist; on this page every card is saved, so toggling means removing.
  const handleCardToggle = (movie: MovieSummary) => {
    void (savedMovieIds.has(movie.id) ? remove(movie) : toggle(movie));
  };

  return (
    <div className="relative isolate flex flex-1 flex-col overflow-x-clip">
      {/* Framer "Floating Animation": a soft aurora across the top of the shelf, fading into the page. */}
      <FloatingAnimation
        amplitude={0.9}
        blend={0.6}
        className="pointer-events-none absolute! inset-x-0 top-0 -z-10 opacity-55 [mask-image:linear-gradient(to_bottom,black_35%,transparent)]"
        colorStops={["#e84c9d", "#149dec", "#7b5cff"]}
        height="34rem"
        speed={0.6}
      />
      <div className="mx-auto w-full max-w-[77rem] px-5 pt-28 pb-16 sm:px-8 md:pt-36 lg:px-12 lg:pb-24">
        <header className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] text-white/80 uppercase sm:text-[0.8125rem]">
            <Bookmark aria-hidden="true" className="size-3.5 fill-current" />
            Watchlist
          </p>
          <h1 className="sr-only">Your movie shelf</h1>
          <div aria-hidden="true" className="mt-3 w-full">
            <MorphText
              fontFamily="var(--font-manrope), sans-serif"
              fontSize="clamp(2.25rem, 8.5vw, 4rem)"
              interval={3200}
              textClassName="tracking-[-0.045em] text-white"
              words={["Your movie shelf", "Saved for later", "Ready for tonight"]}
            />
          </div>
          <p aria-live="polite" className="mt-3 min-h-6 text-base font-semibold text-white/75 sm:text-lg">
            {watchlist.status === "ready" && movies.length > 0 ? savedCountLabel(movies.length) : null}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
            <LockKeyhole aria-hidden="true" className="mr-1.5 -mt-0.5 inline size-3.5" />
            Saved in this browser only, no account needed. Another browser, or clearing this site’s data, starts a fresh shelf.
          </p>
        </header>

        <div className="mt-10 sm:mt-14">
          {watchlist.status === "loading" ? <WatchlistLoading /> : null}

          {watchlist.status === "error" ? (
            <WatchlistNotice
              action={
                <button className={secondaryActionClassName} onClick={retry} type="button">
                  <RotateCcw aria-hidden="true" className="size-4" />
                  Try again
                </button>
              }
              role="alert"
              title="We couldn’t open your shelf right now."
            >
              Your saved movies are safe. Try again in a moment.
            </WatchlistNotice>
          ) : null}

          {watchlist.status === "ready" && movies.length === 0 ? (
            <WatchlistNotice
              action={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link className={cn(buttonVariants({ size: "lg" }), primaryActionClassName)} href="/">
                    <Compass aria-hidden="true" />
                    Discover movies
                  </Link>
                  <Link className={secondaryActionClassName} href="/pick">
                    <Shuffle aria-hidden="true" className="size-4" />
                    Pick for Me
                  </Link>
                </div>
              }
              headingRef={emptyHeadingRef}
              icon={<EmptyShelf />}
              title="Your shelf is empty, for now."
            >
              Save movies from Discover, a movie’s page or Pick for Me, and they’ll wait for you here.
            </WatchlistNotice>
          ) : null}

          {movies.length > 0 ? (
            <ul aria-label="Saved movies" className={movieGridClassName}>
              <AnimatePresence initial mode="popLayout">
                {movies.map((movie, index) => (
                  <ShelfItem
                    index={index}
                    isUpdating={updatingMovieIds.has(movie.id)}
                    key={movie.id}
                    movie={movie}
                    onCardToggle={handleCardToggle}
                    onRemove={(item) => void remove(item)}
                    reduceMotion={reduceMotion}
                  />
                ))}
              </AnimatePresence>
            </ul>
          ) : null}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {statusMessage}
      </p>

      {removed ? (
        <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 md:bottom-8" role="status">
          <div className="flex max-w-full items-center gap-3 rounded-full border border-white/14 bg-[#061126]/92 py-1.5 pr-1.5 pl-5 text-sm text-white shadow-[0_18px_50px_rgb(0_0_0/45%)] backdrop-blur-xl">
            <span className="min-w-0 truncate">
              Removed <span className="font-bold">{removed.title}</span>
            </span>
            <button
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-4 font-bold outline-none transition-colors hover:bg-white/18 focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => void undo()}
              ref={undoButtonRef}
              type="button"
            >
              <Undo2 aria-hidden="true" className="size-4" />
              Undo
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type ShelfItemProps = {
  movie: MovieSummary;
  index: number;
  isUpdating: boolean;
  reduceMotion: boolean;
  onCardToggle: (movie: MovieSummary) => void;
  onRemove: (movie: MovieSummary) => void;
};

/** One saved movie. While it fades out after removal it is inert, so it cannot be clicked or focused again. */
function ShelfItem({ index, isUpdating, movie, onCardToggle, onRemove, reduceMotion }: ShelfItemProps) {
  const isPresent = useIsPresent();

  return (
    <motion.li
      animate={{ filter: "blur(0px)", opacity: 1, scale: 1, y: 0 }}
      aria-hidden={isPresent ? undefined : true}
      className="min-w-0"
      data-movie-id={isPresent ? movie.id : undefined}
      exit={reduceMotion ? { opacity: 0 } : { filter: "blur(6px)", opacity: 0, scale: 0.9 }}
      inert={!isPresent || undefined}
      initial={reduceMotion ? false : { filter: "blur(6px)", opacity: 0, scale: 0.97, y: 14 }}
      layout={!reduceMotion}
      transition={{
        delay: Math.min(index, 12) * 0.035,
        duration: reduceMotion ? 0 : 0.45,
        ease: [0.2, 0.65, 0.3, 0.9],
        layout: { damping: 32, stiffness: 320, type: "spring" },
      }}
    >
      <MovieCard isSaved isUpdating={isUpdating} movie={movie} onWatchlistToggle={onCardToggle} />
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white sm:text-base">{movie.title}</p>
          <p className="text-xs font-semibold text-white/55 sm:text-sm">
            {[movie.releaseDate?.slice(0, 4), movie.voteAverage > 0 ? `★ ${movie.voteAverage.toFixed(1)}` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <button
          aria-label={`Remove ${movie.title} from your watchlist`}
          className="-mt-2 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-white/55 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          data-remove-button={isPresent || undefined}
          disabled={isUpdating}
          onClick={() => onRemove(movie)}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </motion.li>
  );
}

function WatchlistLoading() {
  return (
    <div aria-busy="true" role="status">
      <span className="sr-only">Loading your watchlist…</span>
      <div aria-hidden="true" className={movieGridClassName}>
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index}>
            <div className="aspect-[7/10] rounded-2xl bg-white/7 motion-safe:animate-pulse" />
            <div className="mt-3 h-4 w-3/4 rounded bg-white/7 motion-safe:animate-pulse" />
            <div className="mt-2 h-3 w-1/2 rounded bg-white/5 motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** An empty shelf: three faint poster outlines waiting to be filled. */
function EmptyShelf() {
  return (
    <div aria-hidden="true" className="relative flex h-32 items-end justify-center gap-3">
      <div className="absolute inset-x-6 -bottom-2 h-24 rounded-full bg-[radial-gradient(ellipse,rgb(245_169_92/16%),rgb(232_76_157/8%)_50%,transparent_75%)] blur-xl" />
      <div className="h-24 w-16 -rotate-6 rounded-xl border-2 border-dashed border-white/15" />
      <div className="flex h-28 w-[4.6rem] items-center justify-center rounded-xl border-2 border-dashed border-white/25">
        <Bookmark className="size-6 text-white/45" />
      </div>
      <div className="h-24 w-16 rotate-6 rounded-xl border-2 border-dashed border-white/15" />
      <div className="absolute inset-x-0 -bottom-2 mx-auto h-px w-56 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  );
}

function WatchlistNotice({
  action,
  children,
  headingRef,
  icon,
  role,
  title,
}: {
  action: ReactNode;
  children: ReactNode;
  headingRef?: Ref<HTMLHeadingElement>;
  icon?: ReactNode;
  role?: "alert";
  title: string;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-[2rem] border border-white/10 bg-[#061126]/60 px-6 py-14 text-center backdrop-blur-md sm:py-20"
      role={role}
    >
      {icon ?? (
        <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/70">
          <Bookmark aria-hidden="true" className="size-6" />
        </div>
      )}
      <h2 className="mt-6 text-2xl font-extrabold tracking-[-0.035em] text-white outline-none sm:text-3xl" ref={headingRef} tabIndex={-1}>
        {title}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-white/70 sm:text-base sm:leading-7">{children}</p>
      <div className="mt-7">{action}</div>
    </div>
  );
}
