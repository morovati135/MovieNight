"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Clapperboard, Search } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Discover" },
  { href: "/pick", label: "Pick for Me" },
  { href: "/watchlist", label: "Watchlist" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-40 px-4 sm:top-6 sm:px-8">
      <div className="pointer-events-auto mx-auto flex h-14 w-full max-w-[77rem] items-center justify-between gap-4 rounded-2xl border border-[#1d98d5]/55 bg-[#061126]/78 px-4 shadow-[0_14px_45px_rgb(0_0_0/22%)] backdrop-blur-xl sm:h-[4.6rem] sm:rounded-[1.25rem] sm:px-6 lg:px-8">
        <Link
          aria-label="MovieNight home"
          className="group inline-flex min-h-11 items-center gap-2.5 rounded-lg text-[1.05rem] font-extrabold tracking-[-0.04em] text-white outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#061126]"
          href="/"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-[0_0_24px_rgb(41_187_244/28%)] sm:size-9">
            <Clapperboard aria-hidden="true" className="size-[1.15rem]" />
          </span>
          <span>MovieNight</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden h-full items-center gap-7 md:flex">
          {navigation.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-full items-center px-1 text-[0.95rem] font-semibold text-white/68 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring",
                  isActive &&
                    "text-white after:absolute after:inset-x-0 after:bottom-3.5 after:h-0.5 after:rounded-full after:bg-accent after:shadow-[0_0_12px_rgb(41_187_244/80%)]",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          aria-label="Search movies"
          className="inline-flex size-11 items-center justify-center rounded-xl text-white/82 outline-none transition-colors hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#061126]"
          href="/?search=open"
        >
          <Search aria-hidden="true" className="size-5" />
        </Link>
      </div>
    </header>
  );
}
