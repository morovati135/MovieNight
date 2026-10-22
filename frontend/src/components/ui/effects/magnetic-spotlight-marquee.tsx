"use client";

/*
 * Vengeance UI magnetic-spotlight-marquee: the original image strip and seamless loop.
 * MovieNight changes, requested by the Tech Lead:
 * - the strip stays in place below the section content: no pointer-follow / wake, no title over the strip;
 * - demo content (nav, title, paragraphs, footer, sample images) is replaced by `children` and live posters;
 * - a slower loop, which does not run for reduced motion;
 * - soft fade and blur on the left and right edges;
 * - smooth on every screen: the images are fixed for the page load and preloaded before the loop starts,
 *   and the loop runs on the compositor (Web Animations) instead of GSAP on the main thread, so busy
 *   moments on the page do not make it stutter. Its distance is measured from the tiles and kept in sync
 *   on resize, and its speed is per tile, so it looks the same at every width.
 */

import { type ReactNode, useEffect, useRef, useState } from "react";

import { ResilientImage } from "@/components/ui/resilient-image";
import { cn } from "@/lib/utils";

type MarqueeImage = { key: string | number; src: string };

interface MagneticSpotlightMarqueeProps {
  className?: string;
  images: MarqueeImage[];
  /** Section content, shown above the strip. */
  children?: ReactNode;
  /** Background layers (e.g. AnimatedRays). */
  background?: ReactNode;
}

/** Seconds for one tile (plus gap) to pass: 240 px/s with 180px tiles (the original runs at 600 px/s). */
const secondsPerTile = 196 / 240;
/** Whole copies of the set on the track: enough to cover two set widths on any screen. */
const copies = 3;
/** Start the loop even if some artwork is slow, rather than leave the strip empty. */
const preloadTimeoutMs = 4000;

export function MagneticSpotlightMarquee({ background, children, className, images }: MagneticSpotlightMarqueeProps) {
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  // The strip keeps the first set of images it receives for the whole page load.
  const [stripImages, setStripImages] = useState<MarqueeImage[] | null>(null);
  const [settled, setSettled] = useState<Set<string | number>>(() => new Set());
  const [timedOut, setTimedOut] = useState(false);

  if (stripImages === null && images.length > 0) {
    setStripImages(images);
  }

  const settle = (key: string | number) =>
    setSettled((current) => (current.has(key) ? current : new Set(current).add(key)));
  const isReady = stripImages !== null && (timedOut || stripImages.every((image) => settled.has(image.key)));

  useEffect(() => {
    if (stripImages === null) return;

    const timer = window.setTimeout(() => setTimedOut(true), preloadTimeoutMs);

    return () => window.clearTimeout(timer);
  }, [stripImages]);

  // One seamless loop: the track moves exactly one set width, then repeats.
  useEffect(() => {
    const track = marqueeTrackRef.current;

    if (!track || !isReady || stripImages === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const count = stripImages.length;
    const duration = count * secondsPerTile * 1000;
    const measureSetWidth = () => {
      const tiles = track.children as HTMLCollectionOf<HTMLElement>;
      return tiles[count].offsetLeft - tiles[0].offsetLeft;
    };

    let setWidth = measureSetWidth();
    const start = (offset = 0) => {
      const animation = track.animate(
        [{ transform: "translate3d(0, 0, 0)" }, { transform: `translate3d(${-setWidth}px, 0, 0)` }],
        { duration, easing: "linear", iterations: Infinity },
      );
      animation.currentTime = offset;
      return animation;
    };
    let animation = start();

    // Tiles change size at the md breakpoint: re-measure and continue from the same point in the loop.
    const observer = new ResizeObserver(() => {
      const next = measureSetWidth();

      if (next === setWidth) return;

      const offset = Number(animation.currentTime ?? 0) % duration;
      animation.cancel();
      setWidth = next;
      animation = start(offset);
    });
    observer.observe(track);

    return () => {
      observer.disconnect();
      animation.cancel();
    };
  }, [isReady, stripImages]);

  return (
    <section className={cn("spotlight relative isolate w-full overflow-hidden text-white", className)}>
      {background}

      <div className="relative z-30">{children}</div>

      {/* Marquee Strip */}
      <div
        aria-hidden="true"
        className="spotlight-marquee pointer-events-none relative z-20 h-[160px] w-full [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)] md:h-[200px]"
      >
        {/* Edge blur that fades in towards each side (the mask above fades the strip itself). */}
        <div className="absolute inset-y-0 left-0 z-10 w-[16%] backdrop-blur-[6px] [mask-image:linear-gradient(to_right,black,transparent)]" />
        <div className="absolute inset-y-0 right-0 z-10 w-[16%] backdrop-blur-[6px] [mask-image:linear-gradient(to_left,black,transparent)]" />
        <div
          ref={marqueeTrackRef}
          className={cn(
            "spotlight-marquee-track absolute top-0 left-0 flex h-full items-center gap-4 transition-opacity duration-500 motion-reduce:transition-none",
            isReady ? "opacity-100" : "opacity-0",
          )}
        >
          {Array.from({ length: stripImages ? copies : 0 }, (_, copy) =>
            stripImages!.map((img) => (
              <div
                key={`${copy}-${img.key}`}
                className="relative h-[140px] w-[140px] shrink-0 overflow-hidden rounded-[20px] bg-neutral-900 shadow-sm md:h-[180px] md:w-[180px]"
              >
                <ResilientImage
                  alt=""
                  className="h-full w-full object-cover"
                  fill
                  loading="eager"
                  onFailed={() => settle(img.key)}
                  onLoad={() => settle(img.key)}
                  sizes="180px"
                  src={img.src}
                />
              </div>
            )),
          )}
        </div>
      </div>
    </section>
  );
}

export default MagneticSpotlightMarquee;
