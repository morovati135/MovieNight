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

  return (
    <Button
      aria-label={label === "icon" ? `${action}: ${title}` : undefined}
      aria-pressed={isSaved}
      className={cn(
        isSaved && "bg-accent text-accent-foreground hover:bg-accent/90",
        label === "icon" &&
          "size-10 rounded-full border-white/15 bg-background/75 p-0 text-foreground shadow-lg backdrop-blur-md hover:bg-background/90",
        appearance === "poster" &&
          "relative size-11 rounded-xl border-0 bg-transparent p-0 text-white shadow-none backdrop-blur-none before:pointer-events-none before:absolute before:top-0 before:left-0 before:size-[1.875rem] before:rounded-[0.4rem] before:border before:border-white/14 before:bg-[#030a1b]/24 before:shadow-[inset_0_1px_0_rgb(255_255_255/18%),0_7px_18px_rgb(0_0_0/22%)] before:backdrop-blur-[5px] after:pointer-events-none after:absolute after:top-0 after:left-0 after:size-[1.875rem] after:rounded-[0.4rem] after:bg-gradient-to-br after:from-white/16 after:via-transparent after:to-[#229ee5]/8 hover:bg-transparent hover:shadow-none hover:before:bg-[#071426]/30 focus-visible:ring-offset-0 sm:size-12 sm:rounded-[0.9rem] sm:before:size-[2.8125rem] sm:before:rounded-[0.625rem] sm:after:size-[2.8125rem] sm:after:rounded-[0.625rem] lg:size-16 lg:rounded-[1.35rem] lg:before:size-14 lg:before:rounded-[0.75rem] lg:after:size-14 lg:after:rounded-[0.75rem] [&_svg]:absolute [&_svg]:top-[0.3125rem] [&_svg]:left-[0.3125rem] [&_svg]:z-10 [&_svg]:!size-5 [&_svg]:drop-shadow-[0_1px_3px_rgb(0_0_0/72%)] sm:[&_svg]:top-[0.53125rem] sm:[&_svg]:left-[0.53125rem] sm:[&_svg]:!size-7 lg:[&_svg]:top-[0.75rem] lg:[&_svg]:left-[0.75rem] lg:[&_svg]:!size-8",
        appearance === "poster" &&
          isSaved &&
          "text-white before:border-[#8bd8ff]/28 before:bg-[#229ee5]/24 after:from-white/20 after:to-[#e5228d]/10 hover:before:bg-[#229ee5]/34",
        className,
      )}
      disabled={isUpdating}
      onClick={onToggle}
      size={label === "icon" ? "icon" : "lg"}
      type="button"
      variant={isSaved ? "default" : "outline"}
    >
      <Icon aria-hidden="true" className={cn(isUpdating && "animate-pulse")} />
      {label === "full" ? (isSaved ? "Remove" : "Add to watchlist") : null}
    </Button>
  );
}
