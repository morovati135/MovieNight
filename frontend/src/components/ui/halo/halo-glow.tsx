"use client";

/*
 * Shared pieces of the cult-ui "halo" controls (halo-button, halo-select, halo-search),
 * adapted to MovieNight: brand pink → violet → cyan → blue rim, dark-only surfaces,
 * and a still rim when the visitor prefers reduced motion.
 */

import { useId, useMemo } from "react";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/** Smooth width / thumb movement with very little bounce. */
export const haloLayoutSpring = { bounce: 0.12, damping: 34, stiffness: 420, type: "spring" as const };

const glowBlobs = [
  {
    background: "linear-gradient(90deg, #e84c9d, #7b5cff, #3fd0ff, #149dec)",
    className: "-bottom-4 h-16 w-48 blur-xl",
    duration: 6,
    left: ["-5%", "75%", "-5%"],
  },
  {
    background: "linear-gradient(90deg, #ff6fae, #f5a9d1, #e84c9d)",
    className: "-bottom-3 h-12 w-32 blur-lg",
    duration: 5,
    left: ["65%", "10%", "65%"],
  },
  {
    background: "linear-gradient(90deg, #149dec, #7fd8ff, #7b5cff)",
    className: "-bottom-2 h-10 w-24 blur-lg",
    duration: 4,
    left: ["25%", "55%", "25%"],
  },
];

/** A stable 0–1 number per control, so neighbouring controls never pulse in step. */
function phaseFromId(id: string) {
  let hash = 0;

  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  }

  return hash / 9973;
}

/**
 * Gradient light along the lower rim of a halo control; sits behind a 1px-inset surface.
 * `live` controls sweep continuously; the others rest at their own position and only move while emphasised.
 */
export function HaloGlow({
  className,
  emphasis = false,
  intensity = 1,
  live = false,
}: {
  className?: string;
  emphasis?: boolean;
  /** Speeds up the sweep (e.g. while picking). */
  intensity?: number;
  live?: boolean;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const phase = phaseFromId(useId());
  const isMoving = !reduceMotion && (live || emphasis);

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-full", className)}>
      <motion.div
        animate={{ opacity: emphasis ? 0.95 : live ? 0.7 : 0.42 }}
        className="absolute inset-x-0 bottom-0 h-1/2"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {glowBlobs.map((blob, index) => {
          // Each control gets its own speed and starting point along the sweep.
          const duration = (blob.duration * (0.85 + phase * 0.4)) / intensity;
          const restLeft = blob.left[(index + Math.round(phase * 2)) % 2];

          return (
            <motion.div
              animate={isMoving ? { left: blob.left } : { left: restLeft }}
              className={cn("absolute", blob.className)}
              key={blob.background}
              style={{ background: blob.background }}
              transition={
                isMoving
                  ? { delay: -duration * ((phase + index * 0.37) % 1), duration, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
                  : { duration: reduceMotion ? 0 : 0.8, ease: "easeOut" }
              }
            />
          );
        })}
      </motion.div>
    </div>
  );
}

/** Frosted fill used by every halo surface so the rim light reads through. */
export const haloSurfaceStyle = {
  background:
    "linear-gradient(to bottom, color-mix(in oklch, var(--glass) 86%, transparent) 0%, color-mix(in oklch, var(--glass) 74%, transparent) 100%)",
};

export const haloSurfaceClassName =
  "border border-white/12 shadow-[0_1px_0_rgb(255_255_255/6%)_inset,0_1px_2px_rgb(0_0_0/35%),0_4px_20px_rgb(0_0_0/35%)] backdrop-blur-xl backdrop-saturate-150";

export function HaloSpinner({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex origin-center text-white/70 motion-safe:animate-spin", className)}>
      <svg aria-hidden="true" className="size-3.5" focusable="false" viewBox="0 0 24 24">
        <circle className="opacity-[0.22]" cx="12" cy="12" fill="none" r="9" stroke="currentColor" strokeWidth="2.25" />
        <circle
          cx="12"
          cy="12"
          fill="none"
          r="9"
          stroke="currentColor"
          strokeDasharray="14 42"
          strokeLinecap="round"
          strokeWidth="2.25"
        />
      </svg>
    </span>
  );
}

/**
 * Text that fades in one character at a time. Screen readers get the whole text once,
 * not one letter per element.
 */
export function StaggeredText({
  charDurationSec = 0.16,
  className,
  staggerSec = 0.018,
  text,
}: {
  charDurationSec?: number;
  className?: string;
  staggerSec?: number;
  text: string;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  // Characters are grouped by word so a wrapping line never breaks inside a word.
  const words = useMemo(
    () =>
      text.split(" ").reduce<Array<{ glyphs: Array<{ char: string; index: number }>; key: string }>>((list, word, wordIndex) => {
        // Each word starts one position after the previous word and its trailing space.
        const start = list.reduce((count, previous) => count + previous.glyphs.length + 1, 0);
        const glyphs = Array.from(word, (char, offset) => ({ char, index: start + offset }));

        return [...list, { glyphs, key: `${word}-${wordIndex}` }];
      }, []),
    [text],
  );

  return (
    <span className={cn("relative", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" key={text}>
        {words.map((word, wordIndex) => (
          <span className="inline" key={word.key}>
            <span className="inline-block whitespace-nowrap">
              {word.glyphs.map((glyph) => (
                <motion.span
                  animate={{ opacity: 1 }}
                  className="inline-block whitespace-pre"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  key={glyph.index}
                  transition={{ delay: glyph.index * staggerSec, duration: charDurationSec, ease: "easeOut" }}
                >
                  {glyph.char}
                </motion.span>
              ))}
            </span>
            {wordIndex < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}
