"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Clapperboard, Compass, Heart } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/pick", label: "Pick", icon: Clapperboard },
  { href: "/watchlist", label: "Watchlist", icon: Heart },
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#061126]/92 px-4 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-14px_40px_rgb(0_0_0/26%)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
        {navigation.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.7rem] font-semibold text-white/55 outline-none transition-colors hover:bg-white/6 hover:text-white focus-visible:ring-2 focus-visible:ring-ring",
                isActive && "bg-accent/10 text-accent",
              )}
              href={href}
              key={href}
            >
              <Icon aria-hidden="true" className={cn("size-[1.15rem]", isActive && "stroke-[2.4]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
