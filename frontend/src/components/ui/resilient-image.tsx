"use client";

import { type ReactNode, type SyntheticEvent, useState } from "react";

import Image, { type ImageProps } from "next/image";

type ResilientImageProps = Omit<ImageProps, "onError"> & {
  /** Shown instead of a broken image when the artwork cannot be loaded at all. */
  fallback?: ReactNode;
  /** Called once, when both the optimised and the direct request have failed. */
  onFailed?: () => void;
};

/**
 * `next/image` that never shows a broken image. The Next image optimiser fetches TMDB artwork on the
 * server and gives up on slow upstream responses; when that happens the browser retries the TMDB URL
 * directly, and only if that fails too does `fallback` (or nothing) take the image's place.
 */
export function ResilientImage({ fallback = null, onFailed, onLoad, ...props }: ResilientImageProps) {
  const [attempt, setAttempt] = useState<"optimized" | "direct" | "failed">("optimized");
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);

  // A new image starts over.
  if (failedSrc !== null && failedSrc !== props.src) {
    setFailedSrc(null);
    setAttempt("optimized");
  }

  if (attempt === "failed") {
    return <>{fallback}</>;
  }

  const handleError = () => {
    if (attempt === "optimized") {
      setAttempt("direct");
      setFailedSrc(props.src);
      return;
    }

    setAttempt("failed");
    onFailed?.();
  };

  return (
    <Image
      {...props}
      alt={props.alt}
      key={attempt}
      onError={handleError}
      onLoad={(event: SyntheticEvent<HTMLImageElement>) => onLoad?.(event)}
      unoptimized={attempt === "direct" || props.unoptimized}
    />
  );
}
