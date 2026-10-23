"use client";

/*
 * Navigation indicator in the style of cult-ui halo-tabs ("Tabs — pill"), adapted for links:
 * halo-tabs is built on Base UI Tabs (role="tab"), which is the wrong semantics for site navigation,
 * so MovieNight keeps real links with aria-current and reuses its pill indicator. Like halo-tabs,
 * the indicator is placed from the active item's measured offset and size (CSS transitions, no
 * layout animation), so it stays aligned while the page scrolls or the bar resizes.
 * Colour: one blue family matching the MovieNight theme, in the single-hue style of the halo-toast rims.
 */

import { type RefObject, useLayoutEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Box = { height: number; left: number; top: number; width: number };

/** Measures the `[aria-current=page]` link inside `container` whenever the active item or the size changes. */
export function useActiveBox(container: RefObject<HTMLElement | null>, activeKey: string) {
  const [box, setBox] = useState<Box | null>(null);

  useLayoutEffect(() => {
    const element = container.current;

    if (!element) return;

    const measure = () => {
      const active = element.querySelector<HTMLElement>("[aria-current=page]");
      setBox(
        active ? { height: active.offsetHeight, left: active.offsetLeft, top: active.offsetTop, width: active.offsetWidth } : null,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [activeKey, container]);

  return box;
}

/** The halo-tabs pill: frosted fill with a hairline rim, a blue tint and a soft glow underneath. */
export function NavPill({ box, className }: { box: Box | null; className?: string }) {
  if (!box) return null;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-0 rounded-full transition-[left,width,top,height] duration-300 ease-out motion-reduce:transition-none",
        className,
      )}
      style={{ height: box.height, left: box.left, top: box.top, width: box.width }}
    >
      <span
        className="absolute inset-0 overflow-hidden rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/10%),0_0_0_1px_rgb(56_189_248/18%),0_0_22px_rgb(14_165_233/22%)]"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklch, var(--card) 92%, transparent), color-mix(in oklch, var(--card) 74%, transparent))",
        }}
      />
      <span
        className="absolute inset-0 rounded-[inherit] opacity-90"
        style={{ background: "linear-gradient(90deg, rgb(3 105 161 / 22%), rgb(14 165 233 / 26%), rgb(56 189 248 / 22%))" }}
      />
      <span
        className="absolute inset-x-0 -bottom-px h-1/2 rounded-b-[inherit] opacity-75 blur-sm"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgb(14 165 233 / 36%) 24%, rgb(56 189 248 / 48%) 50%, rgb(20 157 236 / 40%) 76%, transparent 100%)",
        }}
      />
    </span>
  );
}
