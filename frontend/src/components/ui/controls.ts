/*
 * Shared look for floating round controls (rail arrows, genre arrows, hero carousel arrows).
 * Disabled controls fade out completely so they never leave a ghost circle over artwork.
 */
export const glassControlClassName =
  "flex size-11 shrink-0 items-center justify-center rounded-full border border-white/14 bg-glass/76 text-white/85 outline-none backdrop-blur-md transition-[background-color,border-color,color,opacity] hover:border-white/30 hover:bg-glass/92 hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-0";

export const inlineLinkClassName =
  "group/more flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-1 text-sm font-semibold text-link outline-none transition-colors hover:text-link-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-default disabled:opacity-40";

/** Cyan pill used for the primary Home actions (hero "View Details", state retry). */
export const primaryActionClassName =
  "min-h-12 rounded-full border-brand-blue-hover bg-brand-blue px-6 text-white shadow-[0_10px_32px_rgb(20_157_236/25%)] hover:bg-brand-blue-hover";
