"use client";

import { Bookmark, Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WatchlistButtonProps = {
  appearance?: "default" | "poster";
  isSaved: boolean;
  isUpdating: boolean;
  label?: "full" | "icon";
  onToggle: () => void;
  title: string;
  className?: string;
};

export function WatchlistButton({
  appearance = "default",
  className,
  isSaved,
  isUpdating,
  label = "full",
  onToggle,
  title,
}: WatchlistButtonProps) {
  const Icon = isSaved ? Check : appearance === "poster" ? Plus : Bookmark;
  const action = isSaved ? "Remove from watchlist" : "Add to watchlist";
  const icon = (
    <Icon
      aria-hidden="true"
      className={cn(
        isUpdating && "animate-pulse",
        appearance === "poster" &&
          "size-5 drop-shadow-[0_1px_3px_rgb(0_0_0/72%)] sm:size-7 lg:size-8",
      )}
    />
  );

  return (
    <Button
      aria-label={label === "icon" ? `${action}: ${title}` : undefined}
      aria-pressed={isSaved}
      className={cn(
        isSaved && "bg-accent text-accent-foreground hover:bg-accent/90",
        label === "icon" &&
          "size-10 rounded-full border-white/15 bg-background/75 p-0 text-foreground shadow-lg backdrop-blur-md hover:bg-background/90",
        // The hit area stays a comfortable touch target; the glass island is drawn separately below.
        appearance === "poster" &&
          "relative size-11 rounded-xl border-0 bg-transparent p-0 text-white shadow-none backdrop-blur-none hover:bg-transparent hover:shadow-none focus-visible:ring-0 sm:size-12 lg:size-16",
        className,
      )}
      disabled={isUpdating}
      onClick={onToggle}
      size={label === "icon" ? "icon" : "lg"}
      type="button"
      variant={isSaved ? "default" : "outline"}
    >
      {appearance === "poster" ? (
        <span
          aria-hidden="true"
          className={cn(
            // Same geometry as the card's notch island (see the clip path in MovieCard):
            // 26.9% of the card width, corner radius 5.8%. Sized from the card so the glass
            // always fills the whole notch at every breakpoint.
            "pointer-events-none absolute top-0 left-0 grid size-[26.9cqw] place-items-center rounded-[5.8cqw] border border-white/14 bg-[#030a1b]/24 bg-gradient-to-br from-white/16 via-transparent to-[#229ee5]/8 shadow-[inset_0_1px_0_rgb(255_255_255/18%),0_7px_18px_rgb(0_0_0/22%)] backdrop-blur-[5px] transition-colors group-hover/button:bg-[#071426]/30 group-focus-visible/button:ring-2 group-focus-visible/button:ring-ring",
            isSaved &&
              "border-[#8bd8ff]/28 bg-[#229ee5]/24 from-white/20 to-[#e5228d]/10 group-hover/button:bg-[#229ee5]/34",
          )}
        >
          {icon}
        </span>
      ) : (
        icon
      )}
      {label === "full" ? (isSaved ? "Remove" : "Add to watchlist") : null}
    </Button>
  );
}
