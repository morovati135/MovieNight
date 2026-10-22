"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getMovieDetails, MovieNotFoundError, pickMovie } from "@/lib/api/movies";
import type { MovieDetails, MovieSummary } from "@/types/movie";

import type { PickFilters } from "./pick-state";

/** A picked movie plus its details when they arrived in time (null otherwise). */
export type PickedMovie = { movie: MovieSummary; details: MovieDetails | null };

export type PickState =
  | { status: "idle" }
  /** `candidate` is known but stays hidden until its artwork has loaded (or the time budget runs out). */
  | { status: "searching"; candidate: PickedMovie | null }
  | { status: "result"; picked: PickedMovie }
  | { status: "no-match" }
  | { status: "error" };

/** The whole search, including artwork, never keeps the visitor waiting longer than this. */
const revealBudgetMs = 10_000;
/** Short enough to feel instant, long enough that the search does not flash. */
const minimumSearchMs = 900;
/** Quiet retries when the backend repeats a recently shown movie (§13.1) or returns one without a poster. */
const repeatRetries = 2;
const recentLimit = 6;
/** Movies picked again because their poster would not load at all. */
const posterRetries = 2;
/** A replacement pick needs at least this much of the budget left. */
const posterRetryReserveMs = 2_500;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function withinBudget<T>(promise: Promise<T>, deadline: number, fallback: T): Promise<T> {
  return Promise.race([promise, wait(Math.max(deadline - Date.now(), 0)).then(() => fallback)]);
}

export function usePick() {
  const [state, setState] = useState<PickState>({ status: "idle" });
  const requestRef = useRef(0);
  const recentIdsRef = useRef<number[]>([]);
  const timingRef = useRef({ deadline: 0, minimumAt: 0 });
  const [artworkReady, setArtworkReady] = useState(false);

  const filtersRef = useRef<PickFilters | null>(null);
  const posterRetriesRef = useRef(0);

  /**
   * Picks a movie that has a poster and was not shown recently (quiet retries), then loads its details.
   * `fallback` is a candidate to reveal anyway if a replacement search fails.
   */
  const search = useCallback(async (filters: PickFilters, request: number, fallback: PickedMovie | null) => {
    try {
      let movie = await pickMovie(filters);
      const isUsable = (candidate: MovieSummary) => candidate.posterUrl !== null && !recentIdsRef.current.includes(candidate.id);

      for (let retry = 0; retry < repeatRetries && !isUsable(movie) && Date.now() < timingRef.current.deadline; retry++) {
        movie = await pickMovie(filters);
      }

      if (request !== requestRef.current) {
        return;
      }

      recentIdsRef.current = [movie.id, ...recentIdsRef.current.filter((id) => id !== movie.id)].slice(0, recentLimit);
      const details = await withinBudget(
        getMovieDetails(movie.id).catch(() => null),
        timingRef.current.deadline,
        null,
      );

      if (request === requestRef.current) {
        setState({ candidate: { details, movie }, status: "searching" });
      }
    } catch (error: unknown) {
      if (request !== requestRef.current) {
        return;
      }

      if (fallback) {
        setArtworkReady(true);
        setState({ candidate: fallback, status: "searching" });
        return;
      }

      await wait(Math.max(timingRef.current.minimumAt - Date.now(), 0));
      setState({ status: error instanceof MovieNotFoundError ? "no-match" : "error" });
    }
  }, []);

  const pick = useCallback(
    async (filters: PickFilters) => {
      const request = ++requestRef.current;
      const startedAt = Date.now();
      timingRef.current = { deadline: startedAt + revealBudgetMs, minimumAt: startedAt + minimumSearchMs };
      filtersRef.current = filters;
      posterRetriesRef.current = 0;
      setArtworkReady(false);
      setState({ candidate: null, status: "searching" });
      await search(filters, request, null);
    },
    [search],
  );

  // Reveal once the hidden spotlight reports its artwork loaded, or when the budget runs out.
  const candidate = state.status === "searching" ? state.candidate : null;
  const candidateRef = useRef<PickedMovie | null>(null);

  useEffect(() => {
    candidateRef.current = candidate;
  }, [candidate]);

  useEffect(() => {
    if (!candidate) {
      return;
    }

    const { deadline, minimumAt } = timingRef.current;
    const now = Date.now();
    const revealAt = artworkReady ? Math.max(minimumAt, now) : Math.max(deadline, minimumAt);
    const timer = window.setTimeout(() => setState({ picked: candidate, status: "result" }), revealAt - now);

    return () => window.clearTimeout(timer);
  }, [artworkReady, candidate]);

  const markArtworkReady = useCallback(() => setArtworkReady(true), []);

  /**
   * The hidden candidate's poster could not be loaded at all: quietly pick another movie while the
   * budget allows, otherwise reveal it with the designed poster placeholder.
   */
  const markPosterFailed = useCallback(() => {
    const failed = candidateRef.current;
    const filters = filtersRef.current;
    const hasTime = Date.now() < timingRef.current.deadline - posterRetryReserveMs;

    if (!failed || !filters || posterRetriesRef.current >= posterRetries || !hasTime) {
      setArtworkReady(true);
      return;
    }

    posterRetriesRef.current += 1;
    setState({ candidate: null, status: "searching" });
    void search(filters, requestRef.current, failed);
  }, [search]);

  return { markArtworkReady, markPosterFailed, pick, state };
}
