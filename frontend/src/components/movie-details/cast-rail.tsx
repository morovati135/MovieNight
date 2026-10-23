"use client";

import { useId, useRef } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useRailScroll } from "@/components/movie/use-rail-scroll";
import { glassControlClassName } from "@/components/ui/controls";
import { cn } from "@/lib/utils";
import type { MovieDetails } from "@/types/movie";

import { PersonPortrait } from "./person-portrait";

type CastMember = MovieDetails["cast"][number];

type CastRailProps = {
  cast: CastMember[];
  titleClassName: string;
};

// Arrows sit on the centre line of the portraits rather than the whole item (portrait + caption).
const arrowClassName = cn(
  glassControlClassName,
  "absolute top-12 z-20 hidden size-10 -translate-y-1/2 shadow-[0_10px_28px_rgb(0_0_0/32%)] md:flex md:top-14 lg:top-[3.75rem] lg:size-11",
);

export function CastRail({ cast, titleClassName }: CastRailProps) {
  const railId = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const { canScrollNext, canScrollPrevious, scrollRail, updateScrollState } = useRailScroll(railRef, cast.length);

  return (
    <section aria-labelledby={`${railId}-heading`} className="relative isolate">
      <h2 className={cn(titleClassName, "mb-4 sm:mb-6")} id={`${railId}-heading`}>
        Cast
      </h2>

      <div className="relative">
        <div
          aria-label="Cast list"
          className="-mx-4 overflow-x-auto overscroll-x-contain pb-2 outline-none [scroll-padding-inline-start:1rem] [scrollbar-width:none] [scroll-snap-type:x_proximity] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring sm:-mx-8 sm:[scroll-padding-inline-start:2rem] lg:mx-0 lg:[scroll-padding-inline-start:0] [&::-webkit-scrollbar]:hidden"
          id={railId}
          onScroll={updateScrollState}
          ref={railRef}
          role="region"
          tabIndex={0}
        >
          <ul className="grid w-max auto-cols-[6rem] grid-flow-col gap-4 px-4 sm:auto-cols-[7rem] sm:gap-6 sm:px-8 lg:auto-cols-[7.5rem] lg:gap-8 lg:px-0">
            {cast.map((member) => (
              <li className="snap-start" key={`${member.id}-${member.order}`}>
                <PersonPortrait detail={member.character} name={member.name} profileUrl={member.profileUrl} />
              </li>
            ))}
          </ul>
        </div>

        <button
          aria-controls={railId}
          aria-label="Previous cast members"
          className={cn(arrowClassName, "left-1 lg:-left-5")}
          disabled={!canScrollPrevious}
          onClick={() => scrollRail(-1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>
        <button
          aria-controls={railId}
          aria-label="Next cast members"
          className={cn(arrowClassName, "right-1 lg:-right-5")}
          disabled={!canScrollNext}
          onClick={() => scrollRail(1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" className="size-5" />
        </button>
      </div>
    </section>
  );
}
