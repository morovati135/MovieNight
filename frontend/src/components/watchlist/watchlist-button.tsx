"use client";

import { Bookmark, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WatchlistButtonProps = {
  isSaved: boolean;
  isUpdating: boolean;
  label?: "full" | "icon";
  onToggle: () => void;
  title: string;
  className?: string;
};

export function WatchlistButton({
  className,
  isSaved,
  isUpdating,
  label = "full",
  onToggle,
  title,
}: WatchlistButtonProps) {
  const Icon = isSaved ? Check : Bookmark;
  const action = isSaved ? "Remove from watchlist" : "Add to watchlist";

  return (
    <Button
      aria-label={label === "icon" ? `${action}: ${title}` : undefined}
      aria-pressed={isSaved}
      className={cn(
        isSaved && "bg-accent text-accent-foreground hover:bg-accent/90",
        label === "icon" &&
          "size-10 rounded-full border-white/15 bg-background/75 p-0 text-foreground shadow-lg backdrop-blur-md hover:bg-background/90",
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
