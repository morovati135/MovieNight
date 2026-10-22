"use client";

/*
 * Adapted from cult-ui halo-search. MovieNight has no free-text picking, so the field is a read-only
 * prompt line: a shader orb plus a sentence that restates the current choice, and a staggered
 * status line with a spinner while busy. The orb and the shader pause off-screen and for reduced motion.
 */

import { useRef } from "react";

import { Warp, type WarpProps } from "@paper-design/shaders-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import { HaloGlow, HaloSpinner, haloSurfaceClassName, haloSurfaceStyle, StaggeredText } from "./halo-glow";

const warpDefaults: Partial<WarpProps> = {
  colors: ["#f5a9d1", "#149dec", "#7b5cff", "#e84c9d", "#3fd0ff"],
  distortion: 0.25,
  height: 720,
  proportion: 0.54,
  scale: 0.2,
  shape: "checks",
  shapeScale: 1,
  softness: 1,
  swirl: 0.8,
  swirlIterations: 10,
  width: 1280,
};

/** Circular orb with an animated Warp shader; faster while `busy`. */
export function HaloOrb({ busy = false, className }: { busy?: boolean; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const inView = useInView(rootRef, { amount: 0.2 });
  const live = inView && !reduceMotion;

  return (
    <div
      aria-hidden="true"
      className={cn("relative isolate size-9 shrink-0 overflow-hidden rounded-full bg-muted shadow-sm ring-1 ring-white/14", className)}
      ref={rootRef}
    >
      <motion.div
        animate={live ? { rotate: [0, 2, -1.5, 0], scale: [1, 1.055, 0.99, 1] } : { rotate: 0, scale: 1 }}
        className="pointer-events-none absolute inset-0 origin-center rounded-full"
        transition={{ duration: busy ? 1.65 : 5.2, ease: "easeInOut", repeat: live ? Number.POSITIVE_INFINITY : 0 }}
      >
        <Warp {...warpDefaults} speed={live ? (busy ? 3.45 : 1.15) : 0} style={{ height: "100%", width: "100%" }} />
      </motion.div>
    </div>
  );
}

type HaloPromptProps = {
  /** Sentence shown at rest, e.g. a summary of the chosen filters. */
  text: string;
  busy?: boolean;
  busyText?: string;
  className?: string;
};

export function HaloPrompt({ busy = false, busyText = "Working…", className, text }: HaloPromptProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div className={cn("relative w-full rounded-[1.75rem] p-px", className)}>
      <HaloGlow className="rounded-[1.75rem]" emphasis={busy} live intensity={busy ? 1.8 : 1} />
      <div
        className={cn("relative flex min-h-14 items-center gap-3 rounded-[calc(1.75rem-1px)] py-2.5 pr-3 pl-2.5 sm:pr-4", haloSurfaceClassName)}
        style={haloSurfaceStyle}
      >
        <HaloOrb busy={busy} />
        <p className="min-w-0 flex-1 text-sm leading-5 font-semibold text-white/88 sm:text-base">
          <StaggeredText
            charDurationSec={busy ? 0.36 : 0.16}
            key={busy ? "busy" : text}
            staggerSec={busy ? 0.038 : 0.012}
            text={busy ? busyText : text}
          />
        </p>
        <span className="relative flex size-7 shrink-0 items-center justify-center">
          <AnimatePresence initial={false}>
            {busy ? (
              <motion.span
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-white/8 ring-1 ring-white/12"
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.88 }}
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.88 }}
                key="spinner"
                transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
              >
                <HaloSpinner />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </div>
    </div>
  );
}
