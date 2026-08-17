import { Clapperboard, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HomeLoading() {
  return (
    <div
      aria-label="Loading featured movies"
      aria-live="polite"
      className="relative min-h-[calc(100svh-5rem)] overflow-hidden bg-[#020b1b] md:min-h-[100svh] lg:min-h-[46rem] xl:min-h-[min(100svh,54rem)]"
    >
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_68%_35%,rgb(28_52_79/52%),transparent_38%)]" />
      <div className="relative mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-7xl items-end px-5 pb-12 sm:px-8 md:min-h-[100svh] md:pb-32 lg:min-h-[46rem] lg:px-10 lg:pb-16 xl:min-h-[min(100svh,54rem)]">
        <div className="w-full max-w-xl space-y-4">
          <div className="h-12 w-3/4 animate-pulse rounded-xl bg-white/8" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/7" />
          <div className="h-16 w-full animate-pulse rounded-xl bg-white/6" />
          <div className="flex gap-3 pt-1">
            <div className="h-12 w-36 animate-pulse rounded-full bg-white/9" />
            <div className="h-12 w-44 animate-pulse rounded-full bg-white/7" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading featured movies…</span>
    </div>
  );
}

export function HomeError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/[0.06] text-muted-foreground">
        <Clapperboard aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold">We couldn&apos;t load movies right now.</h1>
      <p className="mt-2 max-w-md text-muted-foreground">The cinema is taking an intermission. Try again in a moment.</p>
      <Button className="mt-6" onClick={onRetry} type="button">
        <RotateCcw aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}

export function HomeEmpty() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/[0.06] text-muted-foreground">
        <Clapperboard aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold">Nothing is showing yet.</h1>
      <p className="mt-2 max-w-md text-muted-foreground">There are no trending movies to feature right now.</p>
    </div>
  );
}
