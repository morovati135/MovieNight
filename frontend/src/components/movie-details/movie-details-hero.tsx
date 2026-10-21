import Image from "next/image";

import { ImageIcon } from "lucide-react";

import { WatchlistButton } from "@/components/watchlist/watchlist-button";
import type { MovieDetails } from "@/types/movie";

import { RatingStars } from "./rating-stars";

type MovieDetailsHeroProps = {
  movie: MovieDetails;
  isSaved: boolean;
  isUpdating: boolean;
  onWatchlistToggle: () => void;
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** Up to two production countries by name, e.g. "Germany, United States". */
function formatCountries(codes: string[]) {
  return codes
    .slice(0, 2)
    .map((code) => {
      try {
        return regionNames.of(code) ?? code;
      } catch {
        return code;
      }
    })
    .join(", ");
}

export function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return hours > 0 ? `${hours}h ${rest.toString().padStart(2, "0")}m` : `${rest}m`;
}

export function MovieDetailsHero({ isSaved, isUpdating, movie, onWatchlistToggle }: MovieDetailsHeroProps) {
  const year = movie.releaseDate?.slice(0, 4);
  const countries = formatCountries(movie.productionCountryCodes);
  const facts = [year, movie.runtimeMinutes > 0 ? formatRuntime(movie.runtimeMinutes) : null, countries].filter(
    (fact): fact is string => Boolean(fact),
  );
  // Without a backdrop, a softened poster keeps the hero cinematic instead of an empty panel.
  const artwork = movie.backdropUrl ?? movie.posterUrl;

  return (
    <section aria-labelledby="movie-title" className="relative isolate overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        {artwork ? (
          <Image
            alt=""
            aria-hidden="true"
            className={
              movie.backdropUrl
                ? "object-cover object-[center_20%] motion-safe:animate-[hero-reveal_700ms_ease-out]"
                : "scale-110 object-cover opacity-55 blur-2xl"
            }
            fill
            priority
            sizes="100vw"
            src={artwork}
          />
        ) : null}
        <div className="hero-image-scrim absolute inset-0" />
      </div>

      <div className="flex min-h-[33rem] w-full items-end px-4 pt-32 pb-8 sm:min-h-[38rem] sm:px-8 sm:pb-12 md:min-h-[42rem] lg:min-h-[46rem] lg:px-12 lg:pb-16 xl:min-h-[min(100svh,52rem)]">
        <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-end sm:gap-7 lg:gap-9">
          <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-xl bg-surface shadow-[0_22px_50px_rgb(0_0_0/45%)] ring-1 ring-white/12 sm:w-40 md:w-44 lg:w-52 lg:rounded-2xl">
            {movie.posterUrl ? (
              <Image
                alt={`${movie.title} poster`}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 639px) 112px, (max-width: 1023px) 176px, 208px"
                src={movie.posterUrl}
              />
            ) : (
              <span className="flex h-full items-center justify-center text-muted-foreground">
                <ImageIcon aria-hidden="true" className="size-8" />
              </span>
            )}
          </div>

          <div className="min-w-0 space-y-4 motion-safe:animate-[hero-copy-reveal_550ms_ease-out] sm:space-y-5">
            <h1
              className="max-w-[20ch] text-[2.35rem] font-extrabold leading-[1.04] tracking-[-0.045em] text-balance text-white sm:text-5xl lg:text-[3.5rem]"
              id="movie-title"
            >
              {movie.title}
            </h1>

            {/* As in the reference: facts on one line, the rating on its own line below. Each separator sits in
                the 1.5rem gap before its fact; a fact that starts a line has no gap before it, so its separator
                falls outside the clipped row (including the first fact) whatever wraps. */}
            <div className="space-y-2 text-sm font-semibold text-white/82 sm:text-base">
              {facts.length > 0 ? (
                <p className="flex flex-wrap items-center gap-x-6 gap-y-1 overflow-hidden">
                  {facts.map((fact) => (
                    <span
                      className="relative before:absolute before:-left-[0.95rem] before:text-white/30 before:content-['•']"
                      key={fact}
                    >
                      {fact}
                    </span>
                  ))}
                </p>
              ) : null}
              {movie.voteAverage > 0 ? (
                <p>
                  <RatingStars voteAverage={movie.voteAverage} />
                </p>
              ) : null}
            </div>

            <div className="pt-1">
              <WatchlistButton
                appearance="details"
                isSaved={isSaved}
                isUpdating={isUpdating}
                onToggle={onWatchlistToggle}
                title={movie.title}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
