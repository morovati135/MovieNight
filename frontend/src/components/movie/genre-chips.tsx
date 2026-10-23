"use client";

import { type PointerEvent, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { motion, useReducedMotion } from "motion/react";

import type { Genre } from "@/types/movie";

import { cn } from "@/lib/utils";

type GenreChipsProps = {
  genres: Genre[];
  selectedGenreId: number;
  onSelect: (genreId: number) => void;
  /** Hint that a genre is about to be chosen (hover, focus, touch), so its movies can be fetched early. */
  onIntent?: (genreId: number) => void;
};

// Same spring as the Pick page's segmented control (halo-toggle-group), so the two feel alike.
const thumbSpring = { bounce: 0.12, damping: 34, stiffness: 420, type: "spring" as const };

// Pointer movement beyond this many pixels is a drag-scroll, not a click.
const dragThreshold = 6;

// Chips that run past either end fade out instead of being cut off against the track's rounded edge.
const fadeMasks = {
  both: "[mask-image:linear-gradient(to_right,transparent,#000_1.25rem,#000_calc(100%-1.25rem),transparent)]",
  end: "[mask-image:linear-gradient(to_right,#000_calc(100%-1.25rem),transparent)]",
  none: "",
  start: "[mask-image:linear-gradient(to_right,transparent,#000_1.25rem)]",
};

/**
 * One frosted track of genre chips, styled like the Pick page's segmented controls. The selected chip is a
 * raised thumb that slides between chips. Chips share the track evenly when they fit; otherwise the track
 * scrolls (touch swipe, trackpad, or mouse drag), and the selected chip is kept in view.
 */
export function GenreChips({ genres, onIntent, onSelect, selectedGenreId }: GenreChipsProps) {
  const scrollerId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef(new Map<number, HTMLButtonElement>());
  const dragRef = useRef<{ startX: number; startScroll: number; isDragging: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [thumb, setThumb] = useState({ width: 0, x: 0 });
  const [fade, setFade] = useState<keyof typeof fadeMasks>("none");
  const reduceMotion = useReducedMotion() ?? false;

  const measure = useCallback(() => {
    const chip = chipRefs.current.get(selectedGenreId);
    const scroller = scrollerRef.current;

    setThumb(chip ? { width: chip.offsetWidth, x: chip.offsetLeft } : { width: 0, x: 0 });

    if (scroller) {
      const hiddenBefore = scroller.scrollLeft > 2;
      const hiddenAfter = scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 2;

      setFade(hiddenBefore && hiddenAfter ? "both" : hiddenBefore ? "start" : hiddenAfter ? "end" : "none");
    }
  }, [selectedGenreId]);

  useLayoutEffect(() => {
    measure();
  }, [genres, measure]);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const resizeObserver = new ResizeObserver(measure);

    resizeObserver.observe(scroller);

    if (scroller.firstElementChild) {
      resizeObserver.observe(scroller.firstElementChild);
    }

    return () => resizeObserver.disconnect();
  }, [genres.length, measure]);

  // Keep the selected chip centred in the track; only the track scrolls, never the page.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const chip = chipRefs.current.get(selectedGenreId);

    if (!scroller || !chip) {
      return;
    }

    scroller.scrollTo({
      behavior: reduceMotion ? "auto" : "smooth",
      left: chip.offsetLeft - (scroller.clientWidth - chip.offsetWidth) / 2,
    });
  }, [reduceMotion, selectedGenreId]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;

    if (event.pointerType !== "mouse" || event.button !== 0 || !scroller) {
      return;
    }

    dragRef.current = { isDragging: false, startScroll: scroller.scrollLeft, startX: event.clientX };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const scroller = scrollerRef.current;

    if (!drag || !scroller) {
      return;
    }

    const distance = event.clientX - drag.startX;

    if (!drag.isDragging && Math.abs(distance) > dragThreshold) {
      drag.isDragging = true;
      scroller.setPointerCapture(event.pointerId);
    }

    if (drag.isDragging) {
      scroller.scrollLeft = drag.startScroll - distance;
    }
  };

  const handlePointerEnd = () => {
    // The click that ends a drag must not select the chip under the pointer.
    suppressClickRef.current = dragRef.current?.isDragging ?? false;
    dragRef.current = null;
  };

  return (
    <div className="rounded-full border border-border bg-gradient-to-b from-card/80 to-card/65 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_1px_2px_rgba(0,0,0,0.35),0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150">
      <div
        aria-label="Discover movies by genre"
        className={cn(
          "overflow-x-auto overscroll-x-contain rounded-full p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          fade !== "none" && cn(fadeMasks[fade], "cursor-grab active:cursor-grabbing"),
        )}
        id={scrollerId}
        onPointerCancel={handlePointerEnd}
        onScroll={measure}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        ref={scrollerRef}
        role="toolbar"
      >
        <div className="relative flex w-max min-w-full">
          <motion.div
            animate={{ width: thumb.width, x: thumb.x }}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 left-0 rounded-full border border-white/10 bg-gradient-to-b from-card/95 to-muted/25 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_4px_12px_rgba(0,0,0,0.35)]"
            initial={false}
            transition={reduceMotion ? { duration: 0 } : thumbSpring}
          />
          {genres.map((genre) => (
            <button
              aria-pressed={selectedGenreId === genre.id}
              className={cn(
                "relative min-h-11 flex-1 shrink-0 rounded-full px-4 text-sm font-semibold text-nowrap outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                selectedGenreId === genre.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              key={genre.id}
              onClick={(event) => {
                if (suppressClickRef.current) {
                  suppressClickRef.current = false;
                  event.preventDefault();
                  return;
                }

                onSelect(genre.id);
              }}
              onFocus={() => onIntent?.(genre.id)}
              onPointerDown={() => onIntent?.(genre.id)}
              onPointerEnter={() => onIntent?.(genre.id)}
              ref={(element) => {
                if (element) {
                  chipRefs.current.set(genre.id, element);
                } else {
                  chipRefs.current.delete(genre.id);
                }
              }}
              type="button"
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
