"use client";

/*
 * Adapted from Vengeance UI flip-fade-text: cycles through words, each letter flipping in with a blur.
 * Uses `motion` (already a dependency) instead of framer-motion. Screen readers get one static label;
 * with reduced motion the words change without the flip.
 */

import { memo, useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type FlipFadeTextProps = {
  words: string[];
  /** Read by screen readers instead of the cycling words. */
  label: string;
  /** Milliseconds between words. */
  interval?: number;
  className?: string;
  textClassName?: string;
  letterDuration?: number;
  staggerDelay?: number;
  exitStaggerDelay?: number;
};

const Word = memo(function Word({
  exitStaggerDelay,
  letterDuration,
  reduceMotion,
  staggerDelay,
  text,
  textClassName,
}: {
  exitStaggerDelay: number;
  letterDuration: number;
  reduceMotion: boolean;
  staggerDelay: number;
  text: string;
  textClassName?: string;
}) {
  const letters = useMemo(() => Array.from(text), [text]);

  return (
    <motion.span
      animate="animate"
      className={cn("flex gap-[0.04em] whitespace-pre", textClassName)}
      exit="exit"
      initial="initial"
      variants={{
        animate: { transition: { staggerChildren: reduceMotion ? 0 : staggerDelay } },
        exit: { transition: { staggerChildren: reduceMotion ? 0 : exitStaggerDelay } },
        initial: {},
      }}
    >
      {letters.map((char, index) => (
        <motion.span
          className="inline-block"
          key={`${char}-${index}`}
          style={{ transformStyle: "preserve-3d" }}
          variants={
            reduceMotion
              ? { animate: { opacity: 1 }, exit: { opacity: 0 }, initial: { opacity: 0 } }
              : {
                  animate: {
                    filter: "blur(0px)",
                    opacity: 1,
                    rotateX: 0,
                    transition: { duration: letterDuration, ease: [0.2, 0.65, 0.3, 0.9] },
                    y: 0,
                  },
                  exit: {
                    filter: "blur(8px)",
                    opacity: 0,
                    rotateX: -90,
                    transition: { duration: letterDuration * 0.67, ease: "easeIn" },
                    y: "-0.3em",
                  },
                  initial: { filter: "blur(8px)", opacity: 0, rotateX: 90, y: "0.3em" },
                }
          }
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
});

export function FlipFadeText({
  className,
  exitStaggerDelay = 0.03,
  interval = 2500,
  label,
  letterDuration = 0.5,
  staggerDelay = 0.05,
  textClassName,
  words,
}: FlipFadeTextProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const word = words[index % words.length] ?? "";

  useEffect(() => {
    if (words.length < 2) {
      return;
    }

    const timer = window.setInterval(() => setIndex((current) => (current + 1) % words.length), interval);

    return () => window.clearInterval(timer);
  }, [interval, words.length]);

  return (
    <span className={cn("relative inline-flex items-center justify-center", className)}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="relative flex items-center justify-center" style={{ perspective: "1000px" }}>
        <AnimatePresence initial={false} mode="wait">
          <Word
            exitStaggerDelay={exitStaggerDelay}
            key={word}
            letterDuration={letterDuration}
            reduceMotion={reduceMotion}
            staggerDelay={staggerDelay}
            text={word}
            textClassName={textClassName}
          />
        </AnimatePresence>
      </span>
    </span>
  );
}
