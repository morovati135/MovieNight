"use client";

import { type RefObject, useEffect, useState } from "react";

/** True once `ref` comes within `margin` of the viewport; Home sections below the fold load their data then. */
export function useNearViewport(ref: RefObject<HTMLElement | null>, margin = "800px 0px") {
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || isNear) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
        }
      },
      { rootMargin: margin },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [isNear, margin, ref]);

  return isNear;
}
