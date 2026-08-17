"use client";

import type { Genre } from "@/types/movie";

import { cn } from "@/lib/utils";

type GenreChipsProps = {
  genres: Genre[];
  selectedGenreId: number | null;
  onSelect: (genreId: number | null) => void;
};

export function GenreChips({ genres, onSelect, selectedGenreId }: GenreChipsProps) {
  return (
    <div aria-label="Filter Home movies by genre" className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-2">
        <button
          aria-pressed={selectedGenreId === null}
          className={cn(
            "min-h-10 rounded-full px-4 text-sm font-bold outline-none transition-[background-color,color,box-shadow] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring",
            selectedGenreId === null
              ? "bg-accent text-accent-foreground shadow-[var(--glow-accent)]"
              : "bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1] hover:text-foreground",
          )}
          onClick={() => onSelect(null)}
          type="button"
        >
          All genres
        </button>
        {genres.map((genre) => (
          <button
            aria-pressed={selectedGenreId === genre.id}
            className={cn(
              "min-h-10 rounded-full px-4 text-sm font-bold outline-none transition-[background-color,color,box-shadow] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring",
              selectedGenreId === genre.id
                ? "bg-accent text-accent-foreground shadow-[var(--glow-accent)]"
                : "bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1] hover:text-foreground",
            )}
            key={genre.id}
            onClick={() => onSelect(genre.id)}
            type="button"
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
}
