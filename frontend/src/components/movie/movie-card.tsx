"use client";

import { useId } from "react";

import Link from "next/link";

import { ImageIcon } from "lucide-react";

import { RatingStars } from "@/components/movie-details/rating-stars";
import { ResilientImage } from "@/components/ui/resilient-image";
import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import { cn } from "@/lib/utils";
import type { MovieSummary } from "@/types/movie";

type MovieCardProps = {
  movie: MovieSummary;
  isSaved: boolean;
  isUpdating: boolean;
  onWatchlistToggle: (movie: MovieSummary) => void;
  /** "landscape" is the wide backdrop card (`movie-covers/Cards`) with the title and rating on the artwork. */
  variant?: "poster" | "landscape";
};

// Silhouette of the card: a rounded poster with a notch in the top-left corner for the Watchlist island.
// Shared by the clip path and the keyboard focus outline so they always match.
const cardShapes = {
  // 7:10 poster; the island is 26.9% of the width.
  poster: {
    island: { height: ".189", rx: ".058", ry: ".041", width: ".269" },
    outline:
      "M .403 0 H .904 Q 1 0 1 .068 V .932 Q 1 1 .904 1 H .096 Q 0 1 0 .932 V .284 Q 0 .216 .096 .216 H .211 Q .307 .216 .307 .148 V .068 Q .307 0 .403 0 Z",
  },
  // 16:10 landscape; the same pixel gap and corner radius around a square island 16% of the width.
  landscape: {
    island: { height: ".256", rx: ".025", ry: ".041", width: ".16" },
    outline:
      "M .219 0 H .958 Q 1 0 1 .068 V .932 Q 1 1 .958 1 H .042 Q 0 1 0 .932 V .351 Q 0 .283 .042 .283 H .135 Q .177 .283 .177 .215 V .068 Q .177 0 .219 0 Z",
  },
};

const artworkUnavailable = (
  <span className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
    <ImageIcon aria-hidden="true" className="size-8" />
    Artwork unavailable
  </span>
);

export function MovieCard({
  isSaved,
  isUpdating,
  movie,
  onWatchlistToggle,
  variant = "poster",
}: MovieCardProps) {
  const clipPathId = `movie-card-${useId().replaceAll(":", "")}`;
  const shape = cardShapes[variant];
  const isLandscape = variant === "landscape";
  const artworkUrl = isLandscape ? (movie.backdropUrl ?? movie.posterUrl) : movie.posterUrl;

  return (
    <article className="group min-w-0 snap-start">
      <div className={cn("relative [container-type:inline-size]", isLandscape ? "aspect-[16/10]" : "aspect-[7/10]", " drop-shadow-[0_22px_18px_rgb(0_0_0/32%)] transition-[filter] duration-200 ease-out group-hover:drop-shadow-[0_24px_21px_rgb(0_0_0/38%)]")}>
        <svg aria-hidden="true" className="absolute size-0">
          <defs>
            <clipPath clipPathUnits="objectBoundingBox" id={clipPathId}>
              <path d={shape.outline} />
              <rect {...shape.island} />
            </clipPath>
          </defs>
        </svg>

        <div
          className="absolute inset-0 overflow-hidden bg-surface"
          style={{ clipPath: `url(#${clipPathId})` }}
        >
          <Link
            // Landscape cards show the title, which names the link; portrait cards have no visible text.
            aria-label={isLandscape ? undefined : `View details for ${movie.title}`}
            className="group/link absolute inset-0 z-10 outline-none"
            href={`/movies/${movie.id}`}
          >
            {artworkUrl ? (
              <ResilientImage
                alt={isLandscape ? "" : `${movie.title} poster`}
                className="object-cover transition-[filter,transform] duration-200 ease-out group-hover:brightness-[0.92] motion-safe:group-hover:scale-[1.015]"
                fallback={artworkUnavailable}
                fill
                sizes={isLandscape ? "(max-width: 639px) 240px, (max-width: 1023px) 288px, 352px" : "(max-width: 639px) 112px, (max-width: 1023px) 168px, 208px"}
                src={artworkUrl}
              />
            ) : (
              artworkUnavailable
            )}
            {isLandscape ? (
              <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-[#030a1b] via-[#030a1b]/70 to-transparent px-[5cqw] pt-[14cqw] pb-[4.5cqw]">
                <span className="truncate text-[7.2cqw] leading-tight font-extrabold tracking-[-0.03em] text-white">{movie.title}</span>
                <span className="text-[3.6cqw] font-bold text-white/80">
                  <RatingStars voteAverage={movie.voteAverage} />
                </span>
              </span>
            ) : (
              <span className="absolute inset-0 bg-gradient-to-t from-background/18 via-transparent to-transparent" />
            )}
            {/* Keyboard focus outline: drawn above the artwork and follows the notched silhouette. */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-150 group-focus-visible/link:opacity-100"
              preserveAspectRatio="none"
              viewBox="0 0 1 1"
            >
              <path
                d={shape.outline}
                fill="none"
                stroke="var(--ring)"
                strokeWidth="5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </Link>
        </div>
        <WatchlistButton
          appearance={variant}
          className="absolute top-0 left-0 z-20"
          isSaved={isSaved}
          isUpdating={isUpdating}
          label="icon"
          onToggle={() => onWatchlistToggle(movie)}
          title={movie.title}
        />
      </div>
    </article>
  );
}
