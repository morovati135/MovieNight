"use client";

import { type RefObject, useCallback, useEffect, useState } from "react";

/**
 * Previous/next state and paging for a horizontal rail whose first child is the item track.
 * `itemCount` re-measures the rail when its items change.
 */
export function useRailScroll(railRef: RefObject<HTMLDivElement | null>, itemCount: number) {
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const maximumScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const edgeTolerance = 2;

    setCanScrollPrevious(rail.scrollLeft > edgeTolerance);
    setCanScrollNext(rail.scrollLeft < maximumScroll - edgeTolerance);
  }, [railRef]);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const frame = window.requestAnimationFrame(updateScrollState);
    const resizeObserver = new ResizeObserver(updateScrollState);

    resizeObserver.observe(rail);

    if (rail.firstElementChild) {
      resizeObserver.observe(rail.firstElementChild);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [itemCount, railRef, updateScrollState]);

  const scrollRail = (direction: -1 | 1) => {
    const rail = railRef.current;
    const track = rail?.firstElementChild;

    if (!rail || !(track instanceof HTMLElement)) {
      return;
    }

    const firstItem = track.children.item(0);
    const secondItem = track.children.item(1);
    let scrollDistance = rail.clientWidth * 0.78;

    if (firstItem instanceof HTMLElement && secondItem instanceof HTMLElement) {
      const itemStep = secondItem.offsetLeft - firstItem.offsetLeft;
      const visibleItemCount = Math.max(1, Math.floor(rail.clientWidth / itemStep));

      scrollDistance = itemStep * Math.max(1, visibleItemCount - 1);
    }

    rail.scrollBy({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      left: direction * scrollDistance,
    });
  };

  return { canScrollNext, canScrollPrevious, scrollRail, updateScrollState };
}
