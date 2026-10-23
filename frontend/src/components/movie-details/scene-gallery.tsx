"use client";

import { useId, useRef, useState } from "react";

import Image from "next/image";

import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

import { useRailScroll } from "@/components/movie/use-rail-scroll";
import { glassControlClassName } from "@/components/ui/controls";
import { tmdbImageAtSize } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

import { SceneViewer } from "./scene-viewer";

type SceneGalleryProps = {
  imageUrls: string[];
  title: string;
};

const arrowClassName = cn(
  glassControlClassName,
  "absolute top-1/2 z-20 hidden size-10 -translate-y-1/2 shadow-[0_10px_28px_rgb(0_0_0/32%)] md:flex lg:size-11",
);

/** Row of text-free scene images from the movie, as in the Movie Details reference. */
export function SceneGallery({ imageUrls, title }: SceneGalleryProps) {
  const railId = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const { canScrollNext, canScrollPrevious, scrollRail, updateScrollState } = useRailScroll(railRef, imageUrls.length);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section aria-label={`Scenes from ${title}`} className="relative isolate [container-type:inline-size]">
      <div
        aria-label="Scene list"
        className="-mx-4 overflow-x-auto overscroll-x-contain outline-none [scroll-padding-inline-start:1rem] [scrollbar-width:none] [scroll-snap-type:x_proximity] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring sm:-mx-8 sm:[scroll-padding-inline-start:2rem] lg:mx-0 lg:[scroll-padding-inline-start:0] [&::-webkit-scrollbar]:hidden"
        id={railId}
        onScroll={updateScrollState}
        ref={railRef}
        role="region"
        tabIndex={0}
      >
        {/* From lg, exactly five scenes fill the content width (four 1.5rem gaps); smaller screens peek the next one. */}
        <ul className="grid w-max auto-cols-[14rem] grid-flow-col gap-3.5 px-4 py-1 sm:auto-cols-[16rem] sm:gap-5 sm:px-8 lg:auto-cols-[calc((100cqw-6rem)/5)] lg:gap-6 lg:px-0">
          {imageUrls.map((url, index) => (
            <li className="snap-start" key={url}>
              <button
                aria-haspopup="dialog"
                aria-label={`Open scene ${index + 1} of ${imageUrls.length} in full size`}
                className="group/scene relative block aspect-video w-full overflow-hidden rounded-xl bg-surface ring-1 ring-white/10 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:rounded-2xl"
                onClick={() => setOpenIndex(index)}
                type="button"
              >
                <Image
                  alt=""
                  className="object-cover transition-[filter,transform] duration-200 ease-out group-hover/scene:brightness-90 motion-safe:group-hover/scene:scale-[1.03]"
                  fill
                  sizes="(max-width: 639px) 224px, (max-width: 1279px) 256px, 20vw"
                  // Tiles are small: the lighter 780px file loads reliably; the full-size viewer opens the original.
                  src={tmdbImageAtSize(url, "w780")}
                />
                <span className="absolute right-2.5 bottom-2.5 flex size-8 items-center justify-center rounded-full bg-[#01050f]/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/scene:opacity-100 group-focus-visible/scene:opacity-100">
                  <Maximize2 aria-hidden="true" className="size-4" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        aria-controls={railId}
        aria-label="Previous scenes"
        className={cn(arrowClassName, "left-1 lg:-left-5")}
        disabled={!canScrollPrevious}
        onClick={() => scrollRail(-1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
      </button>
      <button
        aria-controls={railId}
        aria-label="Next scenes"
        className={cn(arrowClassName, "right-1 lg:-right-5")}
        disabled={!canScrollNext}
        onClick={() => scrollRail(1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" className="size-5" />
      </button>

      <SceneViewer imageUrls={imageUrls} onOpenIndexChange={setOpenIndex} openIndex={openIndex} title={title} />
    </section>
  );
}
