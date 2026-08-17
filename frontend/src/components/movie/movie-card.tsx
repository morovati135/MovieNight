"use client";

import Image from "next/image";
import Link from "next/link";

import { ImageIcon, Star } from "lucide-react";

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
  const year = movie.releaseDate?.slice(0, 4) ?? "Coming soon";

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-200 ease-out motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-[1.015]">
        <Link
          aria-label={`View details for ${movie.title}`}
          className="absolute inset-0 z-10 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          href={`/movies/${movie.id}`}
        >
          {movie.posterUrl ? (
            <Image
              alt={`${movie.title} poster`}
              className="object-cover transition-transform duration-200 ease-out motion-safe:group-hover:scale-[1.04]"
              fill
              sizes="(max-width: 640px) 44vw, (max-width: 1024px) 25vw, 190px"
              src={movie.posterUrl}
            />
          ) : (
            <span className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
              <ImageIcon aria-hidden="true" className="size-8" />
              Artwork unavailable
            </span>
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-background via-background/5 to-transparent opacity-70 transition-opacity duration-200 group-hover:opacity-90" />
          <span className="absolute inset-x-0 bottom-0 translate-y-2 px-4 pb-4 text-sm font-bold text-white opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            View details
          </span>
        </Link>
        <WatchlistButton
          className="absolute top-3 right-3 z-20 opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-200 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
          isSaved={isSaved}
          isUpdating={isUpdating}
          label="icon"
          onToggle={() => onWatchlistToggle(movie)}
          title={movie.title}
        />
      </div>
      <div className="space-y-1 px-1 pt-3">
        <h3 className="truncate text-sm font-bold text-foreground sm:text-base">{movie.title}</h3>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
          <span>{year}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Star aria-hidden="true" className="size-3.5 fill-amber-300 text-amber-300" />
            {movie.voteAverage.toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}
