import { Bookmark, Compass, Info, Sparkles } from "lucide-react";

/** Primary destinations, shared by the header and the mobile bar. */
export const navigationItems = [
  { href: "/", icon: Compass, label: "Discover", shortLabel: "Discover" },
  { href: "/pick", icon: Sparkles, label: "Pick for Me", shortLabel: "Pick" },
  { href: "/watchlist", icon: Bookmark, label: "Watchlist", shortLabel: "Watchlist" },
  { href: "/about", icon: Info, label: "About", shortLabel: "About" },
];

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
