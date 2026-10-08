"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Genre } from "@/types/movie";

import { cn } from "@/lib/utils";

type GenreChipsProps = {
  genres: Genre[];
  selectedGenreId: number;
  onSelect: (genreId: number) => void;
};

const arrowClassName =
  "hidden size-11 shrink-0 items-center justify-center rounded-full border border-white/14 bg-[#061126]/76 text-white/85 outline-none transition-[background-color,border-color,color,opacity] hover:border-white/30 hover:bg-[#0b1a34]/92 hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-default disabled:opacity-25 disabled:hover:border-white/14 disabled:hover:bg-[#061126]/76 disabled:hover:text-white/85 md:flex";

export function GenreChips({ genres, onSelect, selectedGenreId }: GenreChipsProps) {
  const scrollerId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);

  const updateScrollState = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const maximumScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const edgeTolerance = 2;

    setCanScrollPrevious(scroller.scrollLeft > edgeTolerance);
    setCanScrollNext(scroller.scrollLeft < maximumScroll - edgeTolerance);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const frame = window.requestAnimationFrame(updateScrollState);
    const resizeObserver = new ResizeObserver(updateScrollState);

    resizeObserver.observe(scroller);

    if (scroller.firstElementChild) {
      resizeObserver.observe(scroller.firstElementChild);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [genres.length, updateScrollState]);

  const scrollChips = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    scroller.scrollBy({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      left: direction * scroller.clientWidth * 0.7,
    });
  };

  return (
    <div className="flex items-center md:gap-3">
      <button
        aria-controls={scrollerId}
        aria-label="Previous genres"
        className={arrowClassName}
        disabled={!canScrollPrevious}
        onClick={() => scrollChips(-1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
      </button>
      <div
        aria-label="Discover movies by genre"
        className="-mx-4 min-w-0 flex-1 overflow-x-auto overscroll-x-contain px-4 py-1 [scroll-padding-inline-start:1rem] [scrollbar-width:none] sm:-mx-8 sm:px-8 sm:[scroll-padding-inline-start:2rem] md:mx-0 md:px-1 md:[scroll-padding-inline-start:0.25rem] [&::-webkit-scrollbar]:hidden"
        id={scrollerId}
        onScroll={updateScrollState}
        ref={scrollerRef}
        role="toolbar"
      >
        <div className="flex min-w-max gap-2.5 sm:gap-3">
          {genres.map((genre) => (
            <button
              aria-pressed={selectedGenreId === genre.id}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-5 text-xs font-semibold text-nowrap outline-none transition-[background-color,border-color,color,box-shadow] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6 sm:text-sm",
                selectedGenreId === genre.id
                  ? "border-[#e84c9d] bg-[#e84c9d] text-white shadow-[0_10px_28px_rgb(232_76_157/22%)]"
                  : "border-[#e84c9d]/55 bg-transparent text-white/78 hover:border-[#35b8ff]/80 hover:bg-white/[0.045] hover:text-white",
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
      <button
        aria-controls={scrollerId}
        aria-label="Next genres"
        className={arrowClassName}
        disabled={!canScrollNext}
        onClick={() => scrollChips(1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}
