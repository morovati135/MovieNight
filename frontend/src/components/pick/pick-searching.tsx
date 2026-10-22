"use client";

import { useEffect, useState } from "react";


import { useReducedMotion } from "motion/react";

import { FlipFadeText } from "@/components/ui/effects/flip-fade-text";
import { HaloGlow } from "@/components/ui/halo/halo-glow";
import { MorphingInfinity } from "@/components/ui/loading/morphing-infinity";
import { ResilientImage } from "@/components/ui/resilient-image";
import { cn } from "@/lib/utils";

import { spotlightFrameClassName } from "./pick-spotlight";

type PickSearchingProps = {
  /** Posters shuffled through the frame while searching (decorative). */
  posterUrls: string[];
  /** Status lines; each one describes a real part of the search. */
  steps: string[];
};

const shuffleMs = 650;

export function PickSearching({ posterUrls, steps }: PickSearchingProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || posterUrls.length < 2) {
      return;
    }

    const timer = window.setInterval(() => setIndex((current) => current + 1), shuffleMs);

    return () => window.clearInterval(timer);
  }, [posterUrls.length, reduceMotion]);

  const visible = posterUrls.length > 0 ? [-1, 0, 1].map((offset) => posterUrls[(index + offset + posterUrls.length) % posterUrls.length]) : [];

  return (
    <div aria-busy="true" className={cn(spotlightFrameClassName, "flex min-h-[38rem] flex-col items-center justify-center px-5 py-12 sm:min-h-[44rem]")}>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgb(20_157_236/20%),transparent_70%),radial-gradient(ellipse_35%_30%_at_60%_60%,rgb(232_76_157/14%),transparent_70%)] motion-safe:animate-pulse"
      />

      <div className="relative w-48 sm:w-60 lg:w-72">
        {visible.slice(0, 1).concat(visible.slice(2)).map((url, side) => (
          <div
            aria-hidden="true"
            className={cn(
              "absolute top-[9%] aspect-[2/3] h-[82%] overflow-hidden rounded-2xl opacity-35 blur-[3px]",
              side === 0 ? "right-[calc(100%+1rem)] sm:right-[calc(100%+2rem)]" : "left-[calc(100%+1rem)] sm:left-[calc(100%+2rem)]",
            )}
            key={`side-${side}`}
          >
            <ResilientImage alt="" className="object-cover" fill sizes="200px" src={url} />
          </div>
        ))}

        <div className="relative rounded-[1.5rem] p-px">
          <HaloGlow className="rounded-[1.5rem]" emphasis intensity={2} live />
          <div className="relative aspect-[2/3] overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#061126]">
            {visible[1] ? (
              <ResilientImage
                alt=""
                className="object-cover opacity-60 blur-md saturate-150"
                fill
                key={visible[1]}
                // Same rendition as the side posters: the poster moving into the frame is already loaded.
                sizes="200px"
                src={visible[1]}
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgb(3_10_27/70%))]" />
            <div className="absolute inset-x-0 top-0 h-1/3 bg-[linear-gradient(to_bottom,rgb(127_216_255/0%),rgb(127_216_255/22%),rgb(127_216_255/0%))] motion-safe:animate-[pick-scan_1.8s_ease-in-out_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <MorphingInfinity aria-hidden="true" className="size-32 text-white drop-shadow-[0_0_14px_rgb(127_216_255/70%)] sm:size-40" role="presentation" />
            </div>
          </div>
        </div>
      </div>

      <p className="sr-only" role="status">
        Picking a movie…
      </p>
      <FlipFadeText
        className="mt-9 min-h-9"
        interval={1500}
        label=""
        letterDuration={0.4}
        staggerDelay={0.02}
        textClassName="text-lg font-bold tracking-[-0.01em] text-white/88 sm:text-xl"
        words={steps}
      />
    </div>
  );
}
