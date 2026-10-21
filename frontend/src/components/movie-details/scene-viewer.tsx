"use client";

import { type KeyboardEvent, useState } from "react";

import Image from "next/image";

import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, LoaderCircle, X } from "lucide-react";

import { glassControlClassName } from "@/components/ui/controls";
import { cn } from "@/lib/utils";

type SceneViewerProps = {
  imageUrls: string[];
  title: string;
  /** Index of the open scene, or null when the viewer is closed. */
  openIndex: number | null;
  onOpenIndexChange: (index: number | null) => void;
};

/**
 * Full-screen viewer for the scene gallery. Shows the original-quality TMDB image (not resized),
 * with previous/next, arrow keys, and Escape / backdrop click to close.
 */
export function SceneViewer({ imageUrls, onOpenIndexChange, openIndex, title }: SceneViewerProps) {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const count = imageUrls.length;
  const index = openIndex ?? 0;
  const url = imageUrls[index];

  const show = (next: number) => onOpenIndexChange((next + count) % count);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(index - 1);
    }
  };

  return (
    <Dialog.Root onOpenChange={(open) => !open && onOpenIndexChange(null)} open={openIndex !== null}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#01050f]/92 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          className="fixed inset-0 z-50 flex flex-col outline-none transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none"
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-8 sm:pt-6">
            <Dialog.Title className="min-w-0 truncate text-sm font-semibold text-white/80 sm:text-base">
              {title} <span className="text-white/50">· Scene {index + 1} of {count}</span>
            </Dialog.Title>
            <Dialog.Close aria-label="Close full-size scene" className={glassControlClassName}>
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-20 sm:py-6">
            {url ? (
              <div className="relative h-full w-full">
                {loadedUrl !== url ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-white/60 motion-safe:animate-spin"
                  />
                ) : null}
                {/* The original file, untouched by the image resizer, for full size and quality. */}
                <Image
                  alt={`Scene ${index + 1} from ${title}`}
                  className={cn(
                    "object-contain transition-opacity duration-200 motion-reduce:transition-none",
                    loadedUrl === url ? "opacity-100" : "opacity-0",
                  )}
                  fill
                  key={url}
                  onLoad={() => setLoadedUrl(url)}
                  sizes="100vw"
                  src={url}
                  unoptimized
                />
              </div>
            ) : null}

            {count > 1 ? (
              <>
                <button
                  aria-label="Previous scene"
                  className={cn(glassControlClassName, "absolute top-1/2 left-3 -translate-y-1/2 sm:left-6")}
                  onClick={() => show(index - 1)}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" className="size-5" />
                </button>
                <button
                  aria-label="Next scene"
                  className={cn(glassControlClassName, "absolute top-1/2 right-3 -translate-y-1/2 sm:right-6")}
                  onClick={() => show(index + 1)}
                  type="button"
                >
                  <ChevronRight aria-hidden="true" className="size-5" />
                </button>
              </>
            ) : null}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
