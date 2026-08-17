"use client";

import { useId } from "react";

import Image from "next/image";
import Link from "next/link";

import { ImageIcon } from "lucide-react";

import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import type { MovieSummary } from "@/types/movie";

type MovieCardProps = {
  movie: MovieSummary;
  isSaved: boolean;
  isUpdating: boolean;
  onWatchlistToggle: (movie: MovieSummary) => void;
};

export function MovieCard({
  isSaved,
  isUpdating,
  movie,
  onWatchlistToggle,
}: MovieCardProps) {
  const clipPathId = `movie-card-${useId().replaceAll(":", "")}`;

  return (
    <article className="group min-w-0 snap-start">
      <div className="relative aspect-[7/10] drop-shadow-[0_22px_18px_rgb(0_0_0/32%)] transition-[filter] duration-200 ease-out group-hover:drop-shadow-[0_24px_21px_rgb(0_0_0/38%)]">
        <svg aria-hidden="true" className="absolute size-0">
          <defs>
            <clipPath clipPathUnits="objectBoundingBox" id={clipPathId}>
              <path d="M .403 0 H .904 Q 1 0 1 .068 V .932 Q 1 1 .904 1 H .096 Q 0 1 0 .932 V .284 Q 0 .216 .096 .216 H .211 Q .307 .216 .307 .148 V .068 Q .307 0 .403 0 Z" />
              <rect height=".189" rx=".058" ry=".041" width=".269" />
            </clipPath>
          </defs>
        </svg>

        <div
          className="absolute inset-0 overflow-hidden bg-surface ring-1 ring-white/7 transition-[filter,ring-color] duration-200 ease-out group-hover:ring-white/16 group-focus-within:ring-accent/70"
          style={{ clipPath: `url(#${clipPathId})` }}
        >
          <Link
            aria-label={`View details for ${movie.title}`}
            className="absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            href={`/movies/${movie.id}`}
          >
            {movie.posterUrl ? (
              <Image
                alt={`${movie.title} poster`}
                className="object-cover transition-[filter,transform] duration-200 ease-out group-hover:brightness-[0.92] motion-safe:group-hover:scale-[1.015]"
                fill
                sizes="(max-width: 639px) 112px, (max-width: 1023px) 168px, 208px"
                src={movie.posterUrl}
              />
            ) : (
              <span className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
                <ImageIcon aria-hidden="true" className="size-8" />
                Artwork unavailable
              </span>
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-background/18 via-transparent to-transparent" />
          </Link>
        </div>
        <WatchlistButton
          appearance="poster"
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
