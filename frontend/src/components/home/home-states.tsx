import type { ReactNode } from "react";

import { Clapperboard, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { primaryActionClassName } from "@/components/ui/controls";
import { cn } from "@/lib/utils";

/**
 * Vertical rhythm shared by the real Home sections and their loading skeleton, so the page does not
 * jump when content arrives. Desktop keeps the accepted H2/H3 spacing; mobile is deliberately tighter.
 */
export const homeSectionsClassName =
  "h2-rails-ambient flex w-full flex-col gap-8 overflow-x-clip px-4 pt-8 pb-12 sm:gap-20 sm:px-8 sm:pt-16 sm:pb-20 lg:gap-24 lg:px-12 lg:pt-20 lg:pb-24";

const heroSizeClassName =
  "min-h-[44rem] md:min-h-[100svh] lg:min-h-[46rem] xl:min-h-[min(100svh,54rem)]";

// Same silhouette as the Hero carousel strip: small, medium, active, medium, small.
const thumbnailSizes = [
  "h-[3.75rem] w-[3.75rem] md:h-[5.5rem] md:w-[5.5rem]",
  "h-[4.5rem] w-[4.5rem] md:h-[6.75rem] md:w-[6.75rem]",
  "h-[5.75rem] w-[5.75rem] md:h-[8.75rem] md:w-[8.75rem]",
  "h-[4.5rem] w-[4.5rem] md:h-[6.75rem] md:w-[6.75rem]",
  "h-[3.75rem] w-[3.75rem] md:h-[5.5rem] md:w-[5.5rem]",
];

const skeletonBlockClassName = "motion-safe:animate-pulse rounded-xl bg-white/9";

export function PosterRowSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid auto-cols-[7.5rem] grid-flow-col gap-3.5 overflow-hidden pb-5 sm:auto-cols-[10.5rem] sm:gap-5 lg:auto-cols-[13rem] lg:gap-8"
    >
      {Array.from({ length: 7 }, (_, index) => (
        <div className={cn(skeletonBlockClassName, "aspect-[7/10] bg-white/6")} key={index} />
      ))}
    </div>
  );
}

function RailSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mb-4 flex min-h-11 items-center sm:mb-7">
        <div className={cn(skeletonBlockClassName, "h-8 w-44 sm:h-9 sm:w-56 lg:h-12 lg:w-80")} />
      </div>
      <PosterRowSkeleton />
    </div>
  );
}

/** Mirrors the real Hero (artwork, copy, carousel strip) and the first two rails. */
export function HomeLoading() {
  return (
    <div aria-busy="true" role="status">
      <div aria-hidden="true" className={cn("relative isolate overflow-hidden bg-background", heroSizeClassName)}>
        <div className="absolute inset-x-0 top-0 h-[31rem] md:h-full">
          <div className="absolute inset-0 motion-safe:animate-pulse bg-[radial-gradient(circle_at_68%_35%,rgb(28_52_79/52%),transparent_42%)]" />
          <div className="hero-image-scrim absolute inset-0" />
        </div>

        <div
          className={cn(
            "relative z-10 mx-auto flex w-full items-start px-4 pt-[29rem] pb-6 sm:px-8 md:items-end md:pt-48 md:pb-60 lg:px-12 lg:pt-40 lg:pb-16",
            heroSizeClassName,
          )}
        >
          <div className="w-full max-w-[39rem] space-y-4 md:space-y-5">
            <div className={cn(skeletonBlockClassName, "h-[5.25rem] w-4/5 sm:h-16")} />
            <div className={cn(skeletonBlockClassName, "h-4 w-1/2 rounded bg-white/7")} />
            <div className="space-y-2">
              <div className={cn(skeletonBlockClassName, "h-4 w-full rounded bg-white/6")} />
              <div className={cn(skeletonBlockClassName, "h-4 w-11/12 rounded bg-white/6")} />
              <div className={cn(skeletonBlockClassName, "h-4 w-2/3 rounded bg-white/6")} />
            </div>
            <div className="flex gap-3 pt-1">
              <div className={cn(skeletonBlockClassName, "h-12 w-36 rounded-full")} />
              <div className={cn(skeletonBlockClassName, "h-12 w-40 rounded-full bg-white/7")} />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-4 top-[17.75rem] z-20 md:inset-x-8 md:top-auto md:bottom-5 lg:inset-x-auto lg:right-10 lg:bottom-8 lg:w-[34rem] xl:right-[6vw]">
          <div className="mx-auto flex h-[6.75rem] max-w-[36rem] items-center justify-center md:h-[8.5rem]">
            {thumbnailSizes.map((sizeClassName, index) => (
              <div
                className={cn(skeletonBlockClassName, sizeClassName, index > 0 && "-ml-4 md:-ml-6")}
                key={index}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={homeSectionsClassName}>
        <RailSkeleton />
        <RailSkeleton />
      </div>
      <span className="sr-only">Loading movies…</span>
    </div>
  );
}

type PageNoticeProps = {
  action?: ReactNode;
  children: ReactNode;
  role?: "alert" | "status";
  title: string;
};

/**
 * Full-page message for page-level failures, empty pages and not-found pages, in the same
 * cinematic frame as the Pick for Me and Watchlist notices.
 */
export function PageNotice({ action, children, role, title }: PageNoticeProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-5 pt-28 pb-16 sm:px-8 md:pt-32">
      <div
        className="relative isolate flex w-full max-w-3xl flex-col items-center overflow-hidden rounded-[2rem] border border-white/10 bg-[#061126]/60 px-6 py-14 text-center shadow-[0_40px_120px_rgb(0_0_0/45%)] backdrop-blur-md sm:py-20"
        role={role}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_45%_at_50%_30%,rgb(20_157_236/14%),transparent_70%),radial-gradient(ellipse_35%_30%_at_60%_70%,rgb(232_76_157/9%),transparent_70%)]"
        />
        <div className="flex size-14 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-white/75 shadow-[0_0_32px_rgb(20_157_236/22%)]">
          <Clapperboard aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-[-0.035em] text-balance text-white sm:text-3xl">{title}</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-white/70 sm:text-base sm:leading-7">{children}</p>
        {action ? <div className="mt-7">{action}</div> : null}
      </div>
    </div>
  );
}

export function HomeError({ onRetry }: { onRetry: () => void }) {
  return (
    <PageNotice
      action={
        <Button className={primaryActionClassName} onClick={onRetry} type="button">
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
      }
      role="alert"
      title="We couldn’t load movies right now."
    >
      The cinema is taking an intermission. Try again in a moment.
    </PageNotice>
  );
}

export function HomeEmpty({ onRetry }: { onRetry: () => void }) {
  return (
    <PageNotice
      action={
        <Button
          className="min-h-12 rounded-full border-white/25 bg-glass/65 px-6 text-white hover:bg-white/10"
          onClick={onRetry}
          type="button"
          variant="outline"
        >
          <RotateCcw aria-hidden="true" />
          Check again
        </Button>
      }
      role="status"
      title="Nothing is showing yet."
    >
      There are no trending movies to feature right now.
    </PageNotice>
  );
}

type SectionNoticeProps = {
  actionLabel?: string;
  children: ReactNode;
  className?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  tone?: "empty" | "error";
};

const sectionNoticeActionClassName =
  "min-h-11 rounded-lg px-3 font-bold text-link outline-none transition-colors hover:text-link-hover focus-visible:ring-2 focus-visible:ring-ring";

/** Contained message used inside a Home section when only that section failed or has no content. */
export function SectionNotice({
  actionLabel = "Try again",
  children,
  className,
  onAction,
  onSecondaryAction,
  secondaryActionLabel,
  tone = "error",
}: SectionNoticeProps) {
  return (
    <div
      className={cn(
        "flex min-h-32 flex-col items-center justify-center gap-x-3 gap-y-1 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-5 text-center text-sm text-white/72 sm:min-h-36 sm:flex-row sm:flex-wrap",
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <span>{children}</span>
      {onAction ? (
        <button className={sectionNoticeActionClassName} onClick={onAction} type="button">
          {actionLabel}
        </button>
      ) : null}
      {onSecondaryAction && secondaryActionLabel ? (
        <button className={sectionNoticeActionClassName} onClick={onSecondaryAction} type="button">
          {secondaryActionLabel}
        </button>
      ) : null}
    </div>
  );
}
