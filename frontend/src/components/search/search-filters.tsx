"use client";

import { type ChangeEvent, type ReactNode, useId, useState } from "react";

import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Genre } from "@/types/movie";

import {
  countFilters,
  earliestReleaseYear,
  latestReleaseYear,
  minimumRatingOptions,
  noFilters,
  type SearchFilters as Filters,
} from "./search-state";

export type GenreOptions =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; genres: Genre[] };

type SearchFiltersProps = {
  filters: Filters;
  genres: GenreOptions;
  onChange: (filters: Filters) => void;
};

const releaseYears = Array.from(
  { length: latestReleaseYear - earliestReleaseYear + 1 },
  (_, index) => latestReleaseYear - index,
);

const clearButtonClassName =
  "min-h-11 shrink-0 rounded-lg px-3 text-sm font-bold text-link outline-none transition-colors hover:text-link-hover focus-visible:ring-2 focus-visible:ring-ring";

type FilterSelectProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  children: ReactNode;
};

function FilterSelect({ children, label, onChange, value }: FilterSelectProps) {
  const id = useId();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value === "" ? null : Number(event.target.value));
  };

  return (
    <div className="relative min-w-0 sm:w-48 lg:w-52">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        className={cn(
          "h-12 w-full cursor-pointer appearance-none truncate rounded-xl border bg-glass/76 pr-10 pl-4 text-sm font-semibold outline-none backdrop-blur-md transition-[background-color,border-color,color] hover:bg-glass/92 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&>option]:bg-[#061126] [&>option]:text-white",
          value === null
            ? "border-white/14 text-white/72 hover:border-white/30"
            : "border-brand-pink/80 text-white shadow-[0_8px_24px_rgb(232_76_157/14%)]",
        )}
        id={id}
        onChange={handleChange}
        value={value ?? ""}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-white/60"
      />
    </div>
  );
}

export function SearchFilters({ filters, genres, onChange }: SearchFiltersProps) {
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = countFilters(filters);
  const update = (change: Partial<Filters>) => onChange({ ...filters, ...change });

  return (
    <div className="mt-4 sm:mt-5">
      {/* Mobile: filters fold away behind one control so the results stay in view. */}
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <button
          aria-controls={panelId}
          aria-expanded={isOpen}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-white/14 bg-glass/76 px-4 text-sm font-semibold text-white outline-none backdrop-blur-md transition-colors hover:bg-glass/92 focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filters
          {activeCount > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-brand-pink text-[0.7rem] font-bold">
              {activeCount}
              <span className="sr-only"> active</span>
            </span>
          ) : null}
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 text-white/60 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")}
          />
        </button>
        {activeCount > 0 ? (
          <button className={clearButtonClassName} onClick={() => onChange(noFilters)} type="button">
            Clear filters
          </button>
        ) : null}
      </div>

      <fieldset
        className={cn("mt-3 gap-3 sm:mt-0 sm:flex sm:flex-wrap sm:items-center", isOpen ? "grid" : "hidden")}
        id={panelId}
      >
        <legend className="sr-only">Filter movies</legend>
        <FilterSelect label="Genre" onChange={(genreId) => update({ genreId })} value={filters.genreId}>
          <option value="">
            {genres.status === "loading"
              ? "Loading genres…"
              : genres.status === "error"
                ? "Genres unavailable"
                : "Any genre"}
          </option>
          {genres.status === "ready"
            ? genres.genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))
            : null}
        </FilterSelect>
        <FilterSelect label="Release year" onChange={(year) => update({ year })} value={filters.year}>
          <option value="">Any year</option>
          {releaseYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Minimum rating" onChange={(minRating) => update({ minRating })} value={filters.minRating}>
          <option value="">Any rating</option>
          {minimumRatingOptions.map((rating) => (
            <option key={rating} value={rating}>
              Rated {rating}+
            </option>
          ))}
        </FilterSelect>
        {activeCount > 0 ? (
          <button className={cn(clearButtonClassName, "hidden sm:inline-flex sm:items-center")} onClick={() => onChange(noFilters)} type="button">
            Clear filters
          </button>
        ) : null}
      </fieldset>
    </div>
  );
}
