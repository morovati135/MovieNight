import Link from "next/link";

import { Clapperboard, Compass, Heart } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/pick", label: "Pick", icon: Clapperboard },
  { href: "/watchlist", label: "Watchlist", icon: Heart },
];

export function MobileNavigation() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-background/90 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
        {navigation.map(({ href, icon: Icon, label }) => (
          <Link
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold text-muted-foreground transition-colors duration-200 ease-out hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" className="size-4" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
